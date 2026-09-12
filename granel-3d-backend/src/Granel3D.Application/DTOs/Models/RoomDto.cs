namespace Granel3D.Application.DTOs.Models;

/// <summary>
/// Информация о комнате квартиры для виджета.
/// </summary>
public class RoomDto
{
    public string Name { get; set; } = null!;
    public decimal Area { get; set; }
    public string? Description { get; set; }
}
