namespace Granel3D.Application.DTOs.Models;

/// <summary>
/// Полная информация о 3D-модели квартиры, отдаваемая публичным API виджету.
/// </summary>
public class ModelResponseDto
{
    /// <summary>Внешний номер квартиры из CRM, например "3130".</summary>
    public string FlatNumber { get; set; } = null!;

    /// <summary>Публичный URL .glb-файла модели (собранный через CDN / S3 base URL).</summary>
    public string FileUrl { get; set; } = null!;

    /// <summary>Номер активной версии модели.</summary>
    public int Version { get; set; }

    /// <summary>Дата и время последнего обновления модели (UTC).</summary>
    public DateTimeOffset LastUpdated { get; set; }

    /// <summary>Точки обзора камеры, отсортированные по DisplayOrder.</summary>
    public List<CameraPointDto> CameraPoints { get; set; } = new();

    /// <summary>Информация о комнатах квартиры.</summary>
    public List<RoomDto> Rooms { get; set; } = new();
}
