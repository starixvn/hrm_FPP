using FPP.Core.Models;
using FPP.Models.InterCharging;
using Microsoft.AspNetCore.Http;

namespace FPP.Services.Interfaces
{
    public interface IInterChargingService
    {
        Task<CommandResult> ImportInterChargingExcelAsync(IFormFile file, string savedFileName, int userId);
    }
}
