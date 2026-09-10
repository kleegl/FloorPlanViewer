namespace Granel3D.Api.Extensions;

public static partial class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers();

        services
            .AddSwagger()
            .AddCorsPolicy(configuration);

        return services;
    }
}
