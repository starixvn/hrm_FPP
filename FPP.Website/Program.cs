using Fanex.Data.SqlServer;
using Fanex.Logging.Sentry.RavenClient;
using FPP.Website;
using FPP.Website.Middlewares;
using GO.UserControl.Client.Core;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.HttpOverrides;
using Newtonsoft.Json;

var builder = WebApplication.CreateBuilder(args);

var services = builder.Services;
var configuration = builder.Configuration;

services.AddControllersWithViews()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.DateTimeZoneHandling = DateTimeZoneHandling.Unspecified;
        options.SerializerSettings.DateFormatString = "dd MMM, yyyy HH:mm:ss";
    });


services.AddFanexLogSentry(configuration);
services.AddFanexSql(configuration);
services.AddCookieAuthentication(configuration);
services.AddRedis(configuration);
services.AddRedisSession(configuration);
services.AddDIServices(configuration);

var app = builder.Build();

UserControlClient
    .UseSession(app.Services.GetRequiredService<IUserControlSession>(), configuration);

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseMiddleware<ErrorHandler>();
    app.UseHsts();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseSession();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

await app.RunAsync();
