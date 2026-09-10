using Granel3D.Domain.Entities.Base;

namespace Granel3D.Domain.Entities;

/// <summary>
/// Информация о комнате квартиры, отображаемая в UI виджета
/// (название, площадь, описание). Привязана к конкретной версии модели,
/// чтобы при rollback данные о комнатах соответствовали геометрии модели.
/// </summary>
public class RoomInfo : BaseEntity
{
    /// <summary>Идентификатор версии модели, к которой относится комната.</summary>
    public int ModelVersionId { get; set; }

    /// <summary>Навигационное свойство на версию модели.</summary>
    public ModelVersion ModelVersion { get; set; } = null!;

    /// <summary>Название комнаты, например "Кухня-гостиная".</summary>
    public string Name { get; set; } = null!;

    /// <summary>Площадь комнаты в квадратных метрах.</summary>
    public decimal Area { get; set; }

    /// <summary>Опциональное описание комнаты для UI.</summary>
    public string? Description { get; set; }
}
