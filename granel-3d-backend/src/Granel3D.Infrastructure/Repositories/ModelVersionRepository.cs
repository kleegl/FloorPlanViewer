using Granel3D.Domain.Entities;
using Granel3D.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Granel3D.Infrastructure.Repositories;

public sealed class ModelVersionRepository : IModelVersionRepository
{
    private readonly Granel3DDbContext _context;

    public ModelVersionRepository(Granel3DDbContext context)
    {
        _context = context;
    }

    public async Task<ModelVersion?> GetActiveByFlatNumberAsync(
        string flatNumber,
        CancellationToken ct = default)
    {
        return await _context.ModelVersions
            .AsNoTracking()
            .Include(x => x.Flat)
            .Include(x => x.CameraPoints.OrderBy(p => p.DisplayOrder))
            .Include(x => x.Rooms)
            .Where(x => x.IsActive && x.Flat.Number == flatNumber)
            .FirstOrDefaultAsync(ct);
    }
}
