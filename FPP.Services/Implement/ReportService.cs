using FPP.Core.Services;
using FPP.Criteria;
using FPP.Models;
using FPP.Services.Interfaces;


namespace FPP.Services.Implement
{
    public class ReportService(
        IBaseService baseService) : IReportService
    {
        public async Task<IEnumerable<MonthlyCostExpenseCategory>> GetCostExpenseExcelAsync(int groupUnitId, int year, int? categoryId)
        {
            var criteria = new GetCostExpenseCriteria
            {
                GroupUnitId = groupUnitId,
                Year = year,
                CategoryId = categoryId
            };
            var data = await baseService.GetDataAsync<MonthlyCostExpenseDetail>(criteria);
            var groupedData = data
                .GroupBy(d => new { d.CategoryId, d.CategoryName })
                .Select(g => new MonthlyCostExpenseCategory
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.CategoryName,
                    Details = g.ToList(),
                    TotalAmount = g.Sum(d => d.TotalAmount)
                })
                .ToList();

            return groupedData;
        }

    }
}
