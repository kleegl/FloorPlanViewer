using Granel3D.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Granel3D.Infrastructure.EntityConfigurations;

public class CameraPointConfiguration : IEntityTypeConfiguration<CameraPoint>
{
    public void Configure(EntityTypeBuilder<CameraPoint> builder)
    {
        builder.ToTable("CameraPoints");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasIndex(x => new { x.ModelVersionId, x.DisplayOrder })
            .IsUnique()
            .HasDatabaseName("ux_camera_points_version_display_order");
    }
}
