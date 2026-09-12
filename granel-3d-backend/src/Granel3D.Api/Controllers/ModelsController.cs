using Granel3D.Application.DTOs.Models;
using Granel3D.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Granel3D.Api.Controllers;

/// <summary>
/// Публичный API для получения 3D-моделей квартир.
/// Используется фронтенд-виджетом, авторизация не требуется.
/// </summary>
[ApiController]
[Route("api/models")]
[Produces("application/json")]
public class ModelsController : ControllerBase
{
    private readonly IModelService _modelService;

    public ModelsController(IModelService modelService)
    {
        _modelService = modelService;
    }

    /// <summary>
    /// Возвращает активную 3D-модель квартиры по её внешнему номеру.
    /// </summary>
    /// <param name="flatNumber">Внешний номер квартиры из CRM, например "3130".</param>
    /// <param name="ct">Токен отмены.</param>
    /// <returns>Данные модели: URL .glb, точки обзора камеры, комнаты.</returns>
    /// <response code="200">Модель найдена и возвращена.</response>
    /// <response code="404">Квартира не найдена или у неё нет активной версии модели.</response>
    [HttpGet("{flatNumber}")]
    [ProducesResponseType(typeof(ModelResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ModelResponseDto>> GetActiveModel(
        string flatNumber,
        CancellationToken ct)
    {
        var model = await _modelService.GetActiveModelAsync(flatNumber, ct);
        return Ok(model);
    }
}
