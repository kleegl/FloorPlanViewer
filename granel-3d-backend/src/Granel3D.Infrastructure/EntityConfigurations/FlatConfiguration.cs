using Granel3D.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Granel3D.Infrastructure.EntityConfigurations;

public class FlatConfiguration : IEntityTypeConfiguration<Flat>
{
    public void Configure(EntityTypeBuilder<Flat> builder)
    {
        builder.ToTable("Flats");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Number)
            .IsRequired()
            .HasMaxLength(512);

        builder.HasIndex(x => x.Number)
            .IsUnique();

        builder.HasMany(x => x.Versions)
            .WithOne(x => x.Flat)
            .HasForeignKey(x => x.FlatId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
