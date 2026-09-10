using Granel3D.Domain.Entities.Base;

namespace Granel3D.Domain.Entities;

/// <summary>
/// Версия 3D-модели квартиры. У одной квартиры может быть несколько версий:
/// например, при перезагрузке исправленной модели или при смене планировки.
/// Ровно одна версия квартиры может быть активной (IsActive = true) —
/// именно её отдаёт публичный API виджету.
/// </summary>
public class ModelVersion : BaseEntity
{
    /// <summary>Идентификатор квартиры, к которой относится версия.</summary>
    public int FlatId { get; set; }

    /// <summary>Навигационное свойство на квартиру.</summary>
    public Flat Flat {  get; set; } = null!;

    /// <summary>
    /// Ключ .glb-файла в S3-хранилище (не полный URL, а ключ объекта).
    /// Полный URL собирается на стороне API или CDN.
    /// </summary>
    public string FileUrl { get; set; } = null!;

    /// <summary>
    /// Порядковый номер версии в рамках квартиры: 1, 2, 3...
    /// Уникален вместе с FlatId.
    /// </summary>
    public int Version { get; set; }

    /// <summary>
    /// Признак активной версии. У квартиры ровно одна активная версия
    /// (обеспечивается partial unique index в БД).
    /// Публичный API всегда отдаёт активную версию.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>Комментарий администратора при загрузке (например, "исправлена геометрия кухни").</summary>
    public string? Comment { get; set; }

    /// <summary>Точки обзора камеры, привязанные к этой версии модели.</summary>
    public ICollection<CameraPoint> CameraPoints { get; set; } = new List<CameraPoint>();

    /// <summary>Информация о комнатах квартиры для этой версии модели.</summary>
    public ICollection<RoomInfo> Rooms { get; set; } = new List<RoomInfo>();
}
