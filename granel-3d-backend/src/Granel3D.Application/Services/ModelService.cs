using Granel3D.Application.DTOs.Models;
using Granel3D.Application.Exceptions;
using Granel3D.Application.Interfaces;
using Granel3D.Domain.Entities;
using Granel3D.Domain.Interfaces;

namespace Granel3D.Application.Services;

public sealed class ModelService : IModelService
{
    private readonly IModelVersionRepository _repository;
    private readonly IStorageService _storage;

    public ModelService(IModelVersionRepository repository, IStorageService storage)
    {
        _repository = repository;
        _storage = storage;
    }

    public async Task<ModelResponseDto> GetActiveModelAsync(string flatNumber, CancellationToken ct = default)
    {
        var version = await _repository.GetActiveByFlatNumberAsync(flatNumber, ct);

        if (version is null)
        {
            throw new NotFoundException($"Active model for flat '{flatNumber}' not found.");
        }

        return MapToDto(version);
    }

    private ModelResponseDto MapToDto(ModelVersion version)
    {
        return new ModelResponseDto
        {
            FlatNumber = version.Flat.Number,
            FileUrl = _storage.GetPublicUrl(version.FileUrl),
            Version = version.Version,
            LastUpdated = version.UpdatedAt,
            CameraPoints = version.CameraPoints
                .OrderBy(p => p.DisplayOrder)
                .Select(p => new CameraPointDto
                {
                    Name = p.Name,
                    Position = new Vector3Dto { X = p.PositionX, Y = p.PositionY, Z = p.PositionZ },
                    Target = new Vector3Dto { X = p.TargetX, Y = p.TargetY, Z = p.TargetZ },
                    DisplayOrder = p.DisplayOrder
                })
                .ToList(),
            Rooms = version.Rooms
                .Select(r => new RoomDto
                {
                    Name = r.Name,
                    Area = r.Area,
                    Description = r.Description
                })
                .ToList()
        };
    }
}
