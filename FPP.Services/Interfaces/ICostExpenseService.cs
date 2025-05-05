using FPP.Core.Models;
using FPP.Models.CostExpense;
using Microsoft.AspNetCore.Http;

namespace FPP.Services.Interfaces
{
    public interface ICostExpenseService
    {
        Task<CommandResult> ImportCostExpenseExcelAsync(IFormFile file, string savedFileName, int userId);

        Task<IEnumerable<MonthlyCostExpenseCategory>> GetCostExpenseExcelAsync(int groupUnitId, int year, int? categoryId);
    }
}
