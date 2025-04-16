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
            var monthlyExpenses = await baseService.GetDataAsync<MonthlyCostExpense>(criteria);
            var grouped = monthlyExpenses
                .GroupBy(x => new { x.CategoryId, x.CategoryName })
                .Select(categoryGroup => new MonthlyCostExpenseCategory
                {
                    CategoryId = categoryGroup.Key.CategoryId,
                    CategoryName = categoryGroup.Key.CategoryName,
                    MonthlyTotalAmounts = categoryGroup
                        .GroupBy(x => x.Month.ToString("yyyy-MM"))
                        .ToDictionary(
                            g => g.Key,
                            g => g.Sum(x => x.Amount)
                        ),
                    Details = categoryGroup
                        .GroupBy(x => new { x.TermId, x.TermName })
                        .Select(termGroup => new MonthlyCostExpenseDetail
                        {
                            TermId = termGroup.Key.TermId,
                            TermName = termGroup.Key.TermName,
                            MonthlyAmounts = termGroup
                                .GroupBy(x => x.Month.ToString("yyyy-MM"))
                                .ToDictionary(
                                    g => g.Key,
                                    g => g.Sum(x => x.Amount)
                                )
                        })
                        .ToList()
                })
                .ToList();

            return grouped;
        }

    }
}
