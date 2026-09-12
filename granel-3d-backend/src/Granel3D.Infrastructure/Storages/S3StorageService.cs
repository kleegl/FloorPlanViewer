using Amazon.S3;
using Amazon.S3.Model;
using Granel3D.Application.Interfaces;
using Granel3D.Application.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Granel3D.Infrastructure.Storages;

public sealed class S3StorageService : IStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly StorageOptions _options;
    private readonly ILogger<S3StorageService> _logger;

    public S3StorageService(
        IAmazonS3 s3,
        IOptions<StorageOptions> options,
        ILogger<S3StorageService> logger)
    {
        _s3 = s3;
        _options = options.Value;
        _logger = logger;
    }

    public async Task UploadAsync(string key, Stream content, string contentType, CancellationToken ct = default)
    {
        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = key,
            InputStream = content,
            ContentType = contentType,
            AutoCloseStream = false
        };

        await _s3.PutObjectAsync(request, ct);
        _logger.LogInformation("Uploaded object {Key} to bucket {Bucket}", key, _options.BucketName);
    }

    public async Task DeleteAsync(string key, CancellationToken ct = default)
    {
        try
        {
            await _s3.DeleteObjectAsync(_options.BucketName, key, ct);
            _logger.LogInformation("Deleted object {Key} from bucket {Bucket}", key, _options.BucketName);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogWarning("Attempted to delete non-existing object {Key}", key);
        }
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken ct = default)
    {
        try
        {
            await _s3.GetObjectMetadataAsync(_options.BucketName, key, ct);
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    public string GetPublicUrl(string key)
    {
        var baseUrl = _options.PublicBaseUrl.TrimEnd('/');
        var cleanKey = key.TrimStart('/');
        return $"{baseUrl}/{cleanKey}";
    }

    public async Task EnsureBucketExistsAsync(CancellationToken ct = default)
    {
        try
        {
            await _s3.GetBucketLocationAsync(_options.BucketName, ct);

            _logger.LogInformation("Bucket {Bucket} already exists", _options.BucketName);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogInformation("Bucket {Bucket} not found, creating...", _options.BucketName);

            await _s3.PutBucketAsync(new PutBucketRequest
            {
                BucketName = _options.BucketName,
                UseClientRegion = true
            }, ct);

            _logger.LogInformation("Bucket {Bucket} created", _options.BucketName);
        }

        await SetPublicReadPolicyAsync(ct);
    }

    /// <summary>
    /// Устанавливаем public read policy для возможности получить файл по url
    /// </summary>
    private async Task SetPublicReadPolicyAsync(CancellationToken ct)
    {
        var policy = $$"""
        {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Sid": "PublicRead",
              "Effect": "Allow",
              "Principal": {"AWS": ["*"]},
              "Action": ["s3:GetObject"],
              "Resource": ["arn:aws:s3:::{{_options.BucketName}}/*"]
            }
          ]
        }
        """;

        try
        {
            await _s3.PutBucketPolicyAsync(new PutBucketPolicyRequest
            {
                BucketName = _options.BucketName,
                Policy = policy
            }, ct);

            _logger.LogInformation("Public read policy applied to bucket {Bucket}", _options.BucketName);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogWarning(ex, "Failed to apply public read policy to bucket {Bucket}", _options.BucketName);
        }
    }
}
