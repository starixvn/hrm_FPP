
namespace FPP.Website;

using System;
using Fanex.Data.Repository;
using Fanex.Logging;
using FPP.Core.Repositories;
using FPP.Core.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public static class ServiceCollectionExtensions
{

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

        services.AddSingleton<IBaseService, BaseService>();
        services.AddSingleton<IBaseRepository, BaseRepository>();
        services.AddSingleton<IDynamicRepository, DynamicRepository>();
        services.AddSingleton<ILogger, Logger>();


        return services;
    }

}