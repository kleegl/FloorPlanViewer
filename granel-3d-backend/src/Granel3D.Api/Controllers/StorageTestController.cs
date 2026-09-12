using Granel3D.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Granel3D.Api.Controllers;

/// <summary>
/// Временный контроллер для проверки работы S3-хранилища.
/// Удалить после появления реального ModelsController (Итерация 3-4).
/// </summary>
[ApiController]
[Route("api/_test/storage")]
public class StorageTestController : ControllerBase
{
    private readonly IStorageService _storage;

    public StorageTestController(IStorageService storage)
    {
        _storage = storage;
    }

    /// <summary>Загружает файл в S3 и возвращает ключ и публичный URL.</summary>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(200 * 1024 * 1024)] // 200 MB
    public async Task<IActionResult> Upload(
        IFormFile file,
        [FromForm] string key,
        CancellationToken ct)
    {
        if (file.Length == 0)
        {
            return BadRequest("File is empty.");
        }

        await using var stream = file.OpenReadStream();
        var contentType = string.IsNullOrWhiteSpace(file.ContentType)
            ? "application/octet-stream"
            : file.ContentType;

        await _storage.UploadAsync(key, stream, contentType, ct);

        return Ok(new
        {
            key,
            publicUrl = _storage.GetPublicUrl(key),
            sizeBytes = file.Length,
            contentType
        });
    }

    /// <summary>Проверяет существование объекта по ключу.</summary>
    [HttpGet("exists")]
    public async Task<IActionResult> Exists([FromQuery] string key, CancellationToken ct)
    {
        var exists = await _storage.ExistsAsync(key, ct);
        return Ok(new { key, exists });
    }

    /// <summary>Удаляет объект по ключу.</summary>
    [HttpDelete]
    public async Task<IActionResult> Delete([FromQuery] string key, CancellationToken ct)
    {
        await _storage.DeleteAsync(key, ct);
        return NoContent();
    }
}
