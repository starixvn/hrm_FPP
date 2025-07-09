using FPP.Core.Criteria.CostExpense;
using FPP.Core.Models;
using FPP.Core.Services;
using FPP.Models.CostExpense;
using FPP.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using OfficeOpenXml;
using FPP.Core.Helpers;

namespace FPP.Services.Implement
{
    public class CostExpenseService(
        IBaseService baseService) : ICostExpenseService
    {
        private const int SheetIndex = 0;
        private const int StartItemRow = 8;
        private const int MonthRow = 2;
        private const int StartMonthCol = 3; // Column C
        private const int EndMonthCol = 14; // Column L
        private const int NameCol = 2; // Column B
        private const int MinLengthGroupUnit = 3;
        private const int UnitCellRow = 1;
        private const int UnitCellCol = 2;

        public async Task<CommandResult> ImportCostExpenseExcelAsync(IFormFile file, string savedFileName, int userId)
        {
            var commandResult = new CommandResult();

            try
            {
                await using var stream = file.OpenReadStream();
                using var package = new ExcelPackage(stream);

                if (package.Workbook.Worksheets.Count == 0)
                {
                    commandResult.Message = "Excel file does not contain any worksheets";
                    return commandResult;
                }

                var worksheet = package.Workbook.Worksheets[SheetIndex];
                var groupUnitId = ExtractGroupUnitId(worksheet);
                if (groupUnitId == null)
                {
                    commandResult.Message = "Could not extract BU ID from the worksheet";
                    return commandResult;
                }

                var monthInfos = ExtractMonths(worksheet);
                if (monthInfos.Count == 0)
                {
                    commandResult.Message = "Could not extract months from the worksheet";
                    return commandResult;
                }

                var (items, duplicateTerm) = ExtractExpenses(worksheet, monthInfos);
                if (items == null)
                {
                    commandResult.Message = $"Duplicate term name found: {duplicateTerm}";
                    return commandResult;
                }
                if (items.Count == 0)
                {
                    commandResult.Message = "Could not extract expense data from the worksheet";
                    return commandResult;
                }

                var criteria = new ImportCostExpenseCriteria
                {
                    GroupUnitId = groupUnitId.Value,
                    FileName = file.FileName,
                    SavedFileName = savedFileName,
                    CreatedBy = userId,
                    TermListJson = JsonConvert.SerializeObject(items),
                };

                commandResult = await baseService.ExecuteNonQueryAsync(criteria);
            }
            catch (Exception ex)
            {
                commandResult.Message = $"Error processing Excel file: {ex.Message}";
            }

            return commandResult;
        }

        private int? ExtractGroupUnitId(ExcelWorksheet worksheet)
        {
            var groupUnitCell = worksheet.Cells[UnitCellRow, UnitCellCol].Text;
            if (groupUnitCell.Length < MinLengthGroupUnit)
            {
                return null;
            }

            var groupUnit = groupUnitCell[..MinLengthGroupUnit];
            return int.TryParse(groupUnit, out var groupUnitId) ? groupUnitId : null;
        }

        private List<MonthInfo> ExtractMonths(ExcelWorksheet worksheet)
        {
            var monthInfos = new List<MonthInfo>();
            for (var col = StartMonthCol; col <= EndMonthCol; col++)
            {
                var cell = worksheet.Cells[MonthRow, col];
                var month = DateTimeHelper.ParseExcelDate(cell.Value);
                if (month == null)
                {
                    continue;
                }

                monthInfos.Add(new MonthInfo
                {
                    Month = month.Value,
                    ColumnIndex = col
                });
            }
            return monthInfos;
        }

        private (List<TermItem>? Items, string? DuplicateTerm) ExtractExpenses(ExcelWorksheet worksheet, List<MonthInfo> monthInfos)
        {
            var result = new List<TermItem>();
            var termNames = new HashSet<string>();

            for (var row = StartItemRow; row <= worksheet.Dimension.End.Row; row++)
            {
                var cellText = worksheet.Cells[row, NameCol].Text.Trim();
                if (string.IsNullOrWhiteSpace(cellText))
                {
                    continue;
                }

                if (!termNames.Add(cellText))
                {
                    return (null, cellText);
                }

                foreach (var monthInfo in monthInfos)
                {
                    var value = worksheet.Cells[row, monthInfo.ColumnIndex].Text;
                    var amount = decimal.TryParse(value, out var a) ? a : 0;

                    result.Add(new TermItem
                    {
                        TermName = cellText,
                        Month = DateTimeHelper.GetMonthStart(monthInfo.Month) ?? monthInfo.Month,
                        Amount = amount
                    });
                }
            }
            return (result, null);
        }

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
                        .GroupBy(x => x.Month.ToString("MMM yyyy"))
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
                                .GroupBy(x => x.Month.ToString("MMM yyyy"))
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
