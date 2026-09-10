using Granel3D.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Granel3D.Infrastructure.EntityConfigurations;

public class RoomInfoConfiguration : IEntityTypeConfiguration<RoomInfo>
{
    public void Configure(EntityTypeBuilder<RoomInfo> builder)
    {
        builder.ToTable("RoomInfos");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.Description)
            .HasMaxLength(2000);

        builder.Property(x => x.Area)
            .HasPrecision(6, 2);
    }
}
