using FPP.Core.Models;
using FPP.Models.ProfitLost;
using Microsoft.AspNetCore.Http;

namespace FPP.Services.Interfaces
{
    public interface IProfitLostService
    {
        Task<CommandResult> ImportProfitLostExcelAsync(IFormFile file, string savedFileName, int userId);

        Task<ProfitLostReportResponse> GetConsolidateProfitLostAsync(DateTime month);

        Task<CostExpenseReportResponse> GetUnitProfitLostAsync(int year, int groupUnitId);

        Task<byte[]> ExportUnitProfitLostToExcelAsync(CostExpenseReportResponse response, int year, int groupUnitId);

        Task<byte[]> ExportProfitLostToExcelAsync(ProfitLostReportResponse response, DateTime month);
    }
}

