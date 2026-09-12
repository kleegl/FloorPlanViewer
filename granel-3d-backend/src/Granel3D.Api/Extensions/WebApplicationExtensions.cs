using Serilog;

namespace Granel3D.Api.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication UseApiPipeline(this WebApplication app)
    {
        app.UseSwagger();
        if (app.Environment.IsDevelopment())
        {
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "Granel3D API v1");
                options.RoutePrefix = "swagger";
                options.DocumentTitle = "Granel3D API";
            });
        }

        ExceptionHandlingMiddlewareExtensions.UseExceptionHandlingMiddleware(app);

        app.UseSerilogRequestLogging();

        app.UseCors("WidgetPolicy");

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        return app;
    }
}
