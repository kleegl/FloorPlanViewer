namespace Granel3D.Application.DTOs.Models;

/// <summary>
/// Точка обзора камеры для виджета.
/// </summary>
public class CameraPointDto
{
    /// <summary>Название точки, отображается на кнопке.</summary>
    public string Name { get; set; } = null!;

    /// <summary>Координаты положения камеры.</summary>
    public Vector3Dto Position { get; set; } = null!;

    /// <summary>Координаты точки, на которую смотрит камера.</summary>
    public Vector3Dto Target { get; set; } = null!;

    /// <summary>Порядок отображения кнопки в UI.</summary>
    public int DisplayOrder { get; set; }
}
