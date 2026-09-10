using Granel3D.Domain.Entities.Base;

namespace Granel3D.Domain.Entities;

/// <summary>
/// Точка обзора камеры для конкретной версии 3D-модели квартиры.
/// Используется виджетом для плавных перелётов камеры по клику на кнопку комнаты.
/// </summary>
public class CameraPoint : BaseEntity
{
    /// <summary>Идентификатор версии модели, к которой привязана точка.</summary>
    public int ModelVersionId { get; set; }

    /// <summary>Навигационное свойство на версию модели.</summary>
    public ModelVersion ModelVersion { get; set; } = null!;

    /// <summary>
    /// Название точки обзора, отображается на кнопке в UI виджета.
    /// Например: "Кухня", "Гостиная", "Санузел".
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Координата X положения камеры в системе координат 3D-модели (в метрах).
    /// </summary>
    public float PositionX { get; set; }

    /// <summary>
    /// Координата Y положения камеры в системе координат 3D-модели (в метрах).
    /// Обычно соответствует высоте глаз пользователя (~1.6 м).
    /// </summary>
    public float PositionY { get; set; }

    /// <summary>
    /// Координата Z положения камеры в системе координат 3D-модели (в метрах).
    /// </summary>
    public float PositionZ { get; set; }

    /// <summary>
    /// Координата X точки, на которую смотрит камера (LookAt target).
    /// </summary>
    public float TargetX { get; set; }

    /// <summary>
    /// Координата Y точки, на которую смотрит камера (LookAt target).
    /// </summary>
    public float TargetY { get; set; }

    /// <summary>
    /// Координата Z точки, на которую смотрит камера (LookAt target).
    /// </summary>
    public float TargetZ { get; set; }

    /// <summary>
    /// Порядок отображения кнопки точки обзора в UI виджета (1, 2, 3...).
    /// Позволяет дизайнеру задать желаемую последовательность комнат,
    /// независимо от порядка добавления в БД.
    /// </summary>
    public int DisplayOrder { get; set; }
}
