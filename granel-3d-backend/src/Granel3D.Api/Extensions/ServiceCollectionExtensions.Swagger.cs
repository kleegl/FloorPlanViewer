using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Net.Http.Headers;
using Microsoft.OpenApi;
using System.Reflection;

namespace Granel3D.Api.Extensions;

public static partial class ServiceCollectionExtensions
{
    public static IServiceCollection AddSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();

        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "Granel3D", Version = "v1" });
            options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "Granel3D.Api.xml"), true);
            options.DescribeAllParametersInCamelCase();

            options.AddSecurityDefinition(
                JwtBearerDefaults.AuthenticationScheme,
                new OpenApiSecurityScheme
                {
                    Description = @"JWT Authorization header using the Bearer scheme.
                        Enter 'Bearer' [space] and then your token in the text input below.
                        Example: 'Bearer 12345abcdef'",
                    Name = HeaderNames.Authorization,
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = JwtBearerDefaults.AuthenticationScheme
                });

            //options.AddSecurityDefinition(
            //    ApiKeyAuthenticationHandler.SchemeName,
            //    new OpenApiSecurityScheme
            //    {
            //        Description = @"API key Authorization header using the Bearer scheme.
            //            Enter 'Bearer' [space] and then your token in the text input below.
            //            Example: 'Bearer 12345abcdef'",
            //        Name = HeaderNames.Authorization,
            //        In = ParameterLocation.Header,
            //        Type = SecuritySchemeType.ApiKey,
            //        Scheme = ApiKeyAuthenticationHandler.SchemeName
            //    });

            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document)] = []
            });
            //options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            //{
            //    [new OpenApiSecuritySchemeReference(ApiKeyAuthenticationHandler.SchemeName, document)] = []
            //});


            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
            }
        });

        return services;
    }
}
