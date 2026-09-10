using Granel3D.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Granel3D.Infrastructure;

public class Granel3DDbContext : DbContext
{
    public Granel3DDbContext(DbContextOptions<Granel3DDbContext> options)
        : base(options)
    {
    }

    public DbSet<Flat> Flats { get; set; }
    public DbSet<ModelVersion> ModelVersions { get; set; }
    public DbSet<CameraPoint> CameraPoints { get; set; }
    public DbSet<RoomInfo> Rooms { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Granel3DDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
