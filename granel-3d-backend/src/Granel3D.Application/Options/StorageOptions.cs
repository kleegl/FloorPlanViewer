namespace Granel3D.Application.Options;

/// <summary>
/// Настройки S3-совместимого хранилища. Биндится из секции "S3" в appsettings.
/// </summary>
public class StorageOptions
{
    public const string SectionName = "S3";

    /// <summary>Endpoint S3-сервиса, например "http://localhost:9000" для Minio.</summary>
    public string ServiceUrl { get; set; } = null!;

    public string AccessKey { get; set; } = null!;
    public string SecretKey { get; set; } = null!;

    /// <summary>Имя бакета для хранения .glb-моделей.</summary>
    public string BucketName { get; set; } = null!;

    /// <summary>
    /// Базовый URL для сборки публичных ссылок на файлы.
    /// В dev — "http://localhost:9000/{bucket}", в prod — "https://cdn.granelle.ru".
    /// </summary>
    public string PublicBaseUrl { get; set; } = null!;

    /// <summary>
    /// Использовать path-style адресацию (endpoint/bucket/key).
    /// Обязательно true для Minio; для Yandex S3 можно false при custom-домене.
    /// </summary>
    public bool ForcePathStyle { get; set; }
}
