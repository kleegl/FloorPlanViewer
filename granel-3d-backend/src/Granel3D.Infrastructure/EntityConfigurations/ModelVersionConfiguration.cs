using Granel3D.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Granel3D.Infrastructure.EntityConfigurations;
public class ModelVersionConfiguration : IEntityTypeConfiguration<ModelVersion>
{
    public void Configure(EntityTypeBuilder<ModelVersion> builder)
    {
        builder.ToTable("ModelVersions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FileUrl)
            .IsRequired()
            .HasMaxLength(1024);

        builder.Property(x => x.Comment)
            .HasMaxLength(2000);

        builder.HasIndex(x => new { x.FlatId, x.Version })
            .IsUnique()
            .HasDatabaseName("ux_model_versions_flat_version");

        // Partial unique index: одна активная версия на квартиру.
        builder.HasIndex(x => x.FlatId)
            .IsUnique()
            .HasFilter("\"IsActive\" = true")
            .HasDatabaseName("ux_model_versions_active_per_flat");

        builder.HasMany(x => x.CameraPoints)
            .WithOne(x => x.ModelVersion)
            .HasForeignKey(x => x.ModelVersionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Rooms)
            .WithOne(x => x.ModelVersion)
            .HasForeignKey(x => x.ModelVersionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
