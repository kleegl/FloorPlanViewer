using Granel3D.Application.Interfaces;
using Granel3D.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Granel3D.Application;

public static class DI
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IModelService, ModelService>();

        return services;
    }
}
