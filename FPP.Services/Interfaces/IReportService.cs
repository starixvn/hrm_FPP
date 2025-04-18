using FPP.Models;

namespace FPP.Services.Interfaces
{
    public interface IReportService
    {
        Task<IEnumerable<MonthlyCostExpenseCategory>> GetCostExpenseExcelAsync(int groupUnitId, int year, int? categoryId);
    }
}
