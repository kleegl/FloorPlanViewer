using Granel3D.Domain.Entities.Base;

namespace Granel3D.Domain.Entities;

/// <summary>
/// Квартира. Хранит внешний идентификатор из CRM заказчика,
/// к которому привязываются версии 3D-модели.
/// </summary>
public class Flat : BaseEntity
{
    /// <summary>
    /// Внешний идентификатор квартиры из CRM заказчика, например "3130".
    /// Используется в URL виджета: /api/models/{number}.
    /// Уникален в рамках системы.
    /// </summary>
    public string Number { get; set; } = null!;

    /// <summary>Все версии 3D-модели, загруженные для этой квартиры.</summary>
    public ICollection<ModelVersion> Versions { get; set; } = new List<ModelVersion>();
}
