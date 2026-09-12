using Granel3D.Domain.Entities;

namespace Granel3D.Domain.Interfaces;

/// <summary>
/// Репозиторий для работы с версиями 3D-моделей.
/// </summary>
public interface IModelVersionRepository
{
    /// <summary>
    /// Возвращает активную версию модели для квартиры с указанным номером
    /// вместе с точками обзора и комнатами.
    /// Возвращает null, если квартиры или активной версии не существует.
    /// </summary>
    Task<ModelVersion?> GetActiveByFlatNumberAsync(string flatNumber, CancellationToken ct = default);
}
