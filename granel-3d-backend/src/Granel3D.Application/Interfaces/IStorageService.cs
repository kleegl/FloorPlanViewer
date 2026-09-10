namespace Granel3D.Application.Interfaces;

/// <summary>
/// Абстракция над S3-совместимым хранилищем файлов.
/// Используется для загрузки/удаления .glb-моделей и генерации публичных URL.
/// </summary>
public interface IStorageService
{
    /// <summary>
    /// Загружает объект в хранилище. Если объект с таким ключом уже существует —
    /// перезаписывает его. Валидация коллизий — на уровне вызывающего сервиса.
    /// </summary>
    /// <param name="key">Ключ объекта, например "models/3130/v1/model.glb".</param>
    /// <param name="content">Поток с содержимым файла.</param>
    /// <param name="contentType">MIME-тип, например "model/gltf-binary".</param>
    Task UploadAsync(string key, Stream content, string contentType, CancellationToken ct = default);

    /// <summary>
    /// Удаляет объект. Если объекта нет — не бросает исключение.
    /// </summary>
    Task DeleteAsync(string key, CancellationToken ct = default);

    /// <summary>
    /// Проверяет, существует ли объект с указанным ключом.
    /// </summary>
    Task<bool> ExistsAsync(string key, CancellationToken ct = default);

    /// <summary>
    /// Возвращает публичный URL объекта на основе настроенного CDN / базового URL.
    /// Не делает запросов в S3.
    /// </summary>
    string GetPublicUrl(string key);

    /// <summary>
    /// Гарантирует, что бакет для моделей существует. Если нет — создаёт.
    /// Вызывается один раз при старте приложения (в Development).
    /// </summary>
    Task EnsureBucketExistsAsync(CancellationToken ct = default);
}
