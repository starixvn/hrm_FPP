namespace FPP.Website;

using System;
using Core.Services;
using Fanex.Caching.Redis;
using Fanex.Data.Repository;
using Fanex.Logging;
using FPP.Core.Models;
using GO.UserControl.Client.AspNetCore;
using GO.UserControl.Client.AspNetCore.Session;
using GO.UserControl.Client.Core;
using GO.UserControl.Client.Core.Services;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Services.Implement;
using Services.Interfaces;
using StackExchange.Redis;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCookieAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.LoginPath = configuration.GetSection("AuthSettings:LoginPath").Value;
                options.LogoutPath = configuration.GetSection("AuthSettings:LogoutPath").Value;
                options.ExpireTimeSpan = TimeSpan.FromMinutes(int.Parse(configuration.GetSection("AuthSettings:CookieTimeOut").Value));
                options.Cookie = new CookieBuilder
                {
                    Name = "FPP.Website.Cookies",
                    SecurePolicy = CookieSecurePolicy.SameAsRequest
                };
                options.Events.OnSigningOut = x =>
                {
                    x.Response.Redirect(options.LoginPath);
                    return Task.CompletedTask;
                };
            });

        return services;
    }

    public static IServiceCollection AddRedis(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddRedisCache(configuration.GetSection("fanex.caching.redis"));

        var redisConfig = configuration.GetSection("AuthSettings:RedisConfig").Value;
        var redisMultiplexer = ConnectionMultiplexer.Connect(redisConfig);

        services.AddDataProtection().PersistKeysToStackExchangeRedis(redisMultiplexer, "FPP.Website:ProtectionKeys");

        services.AddSingleton(redisMultiplexer);

        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConfig;
            options.InstanceName = "FPP.Website:Session:";
        });

        return services;
    }

    public static IServiceCollection AddRedisSession(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSession(options =>
        {
            options.Cookie.IsEssential = true;
            options.IdleTimeout = TimeSpan.FromMinutes(int.Parse(configuration.GetSection("AuthSettings:SessionTimeOut").Value));
            options.Cookie.Name = "FPP.Website.Session";
        });

        return services;
    }

    public static IServiceCollection AddDIServices(this IServiceCollection services, IConfiguration configuration)
    {
        var amazonConfig = configuration.GetSection("AmazonStorageConfig").Get<AmazonStorageConfig>();
        services.AddSingleton(amazonConfig);

        services.AddSingleton<ILogger, Logger>();

        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.AddSingleton<IUserControlSettings>(new UserControlSettings(configuration));
        services.AddSingleton<IUserControlSession, UserControlSession>();
        services.AddSingleton<IAuthService, AuthService>();
        services.AddSingleton<ICryptoService, CryptoService>();
        services.AddSingleton<IUserService, UserService>();
        services.AddSingleton<IRoleService, RoleService>();
        services.AddSingleton<IFunctionService, FunctionService>();

        services.AddSingleton<IDynamicRepository, DynamicRepository>();

        services.AddSingleton<IBaseService, BaseService>();
        services.AddSingleton<IMinIOService, MinIOService>();
        services.AddSingleton<IUploadService, UploadService>();

        return services;
    }
}