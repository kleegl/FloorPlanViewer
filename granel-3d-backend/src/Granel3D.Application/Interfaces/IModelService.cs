using Granel3D.Application.DTOs.Models;

namespace Granel3D.Application.Interfaces;

public interface IModelService
{
    /// <summary>
    /// Возвращает активную модель квартиры по её внешнему номеру.
    /// Бросает NotFoundException, если квартиры или активной версии нет.
    /// </summary>
    Task<ModelResponseDto> GetActiveModelAsync(string flatNumber, CancellationToken ct = default);
}
