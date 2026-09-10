namespace Granel3D.Domain.Entities.Base;

/// <summary>
/// Базовая сущность с техническими полями, общими для всех таблиц:
/// первичный ключ и временные метки создания/обновления.
/// Заполнение CreatedAt/UpdatedAt происходит автоматически
/// через AuditableEntityInterceptor.
/// </summary>
public abstract class BaseEntity
{
    /// <summary>Первичный ключ (автоинкремент).</summary>
    public int Id { get; set; }

    /// <summary>Дата и время создания записи (UTC).</summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>Дата и время последнего обновления записи (UTC).</summary>
    public DateTimeOffset UpdatedAt { get; set; }
}
