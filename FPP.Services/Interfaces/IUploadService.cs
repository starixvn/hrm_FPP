using FPP.Core.Models;
using FPP.Models;
using Microsoft.AspNetCore.Http;

namespace FPP.Services.Interfaces
{
    public interface IUploadService
    {
        Task<CommandResult> ImportCostExpenseExcelAsync(IFormFile file, string savedFileName);

        Task<IEnumerable<MonthlyCostExpenseCategory>> GetCostExpenseExcelAsync(int groupUnitId, int year, int? categoryId);
    }
}
