using FPP.Core.Models;
using FPP.Models.ProfitLost;
using Microsoft.AspNetCore.Http;

namespace FPP.Services.Interfaces
{
    public interface IProfitLostService
    {
        Task<CommandResult> ImportProfitLostExcelAsync(IFormFile file, string savedFileName, int userId);

        Task<ProfitLostReportResponse> GetProfitLostExcelAsync(DateTime month);

        Task<byte[]> ExportProfitLostToExcelAsync(ProfitLostReportResponse response, DateTime month);
    }
}

