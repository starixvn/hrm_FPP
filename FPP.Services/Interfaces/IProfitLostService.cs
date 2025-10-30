using FPP.Core.Models;
using FPP.Models.ProfitLost;
using Microsoft.AspNetCore.Http;

namespace FPP.Services.Interfaces
{
    public interface IProfitLostService
    {
        Task<CommandResult> ImportProfitLostExcelAsync(IFormFile file, string savedFileName, int userId);

        Task<IEnumerable<MonthlyProfitLostCategory>> GetProfitLostExcelAsync(DateTime month);
    }
}

