using FPP.Core.Criteria.ProfitLost;
using FPP.Core.Enums;
using FPP.Core.Helpers;
using FPP.Core.Models;
using FPP.Core.Services;
using FPP.Models.CostExpense;
using FPP.Models.ProfitLost;
using FPP.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using OfficeOpenXml;
using System.Text;

namespace FPP.Services.Implement
{
    public class ProfitLostService(
        IBaseService baseService,
        IWebHostEnvironment hostingEnvironment) : IProfitLostService
    {
        private const string ProfitLostExportTemplate = "ExcelTemplates/BU P&L Upload Template.xlsx";
        private const string UnitProfitLostExportTemplate = "ExcelTemplates/BU P&L Unit Template.xlsx";
        private const int SheetIndex = 0;
        private const int MonthCellRow = 1; // Row 1
        private const int MonthCellCol = 3; // Column C (C1)
        private const int BUCodeRow = 5; // Row 5 contains BU codes (901OT, 902SP, etc.)
        private const int StartBUCol = 4; // Column D is where BU data starts
        private const int StartDataRow = 6; // Row 6 is where data starts (after headers)
        private const int MetricCol = 2; // Column B contains metrics

        public async Task<CommandResult> ImportProfitLostExcelAsync(IFormFile file, string savedFileName, int userId)
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

                var month = ExtractMonth(worksheet);
                if (month == null)
                {
                    commandResult.Message = "Could not extract month/year from cell B1";
                    return commandResult;
                }

                var buInfos = ExtractBUInfos(worksheet);
                if (buInfos.Count == 0)
                {
                    commandResult.Message = "Could not extract BU information from the worksheet";
                    return commandResult;
                }

                var (items, duplicateTerm) = ExtractProfitLost(worksheet, buInfos);
                if (!string.IsNullOrEmpty(duplicateTerm))
                {
                    commandResult.Message = $"Duplicate term name found: {duplicateTerm}";
                    return commandResult;
                }
                if (items == null || items.Count == 0)
                {
                    commandResult.Message = "Could not extract BU P&L data from the worksheet";
                    return commandResult;
                }

                var criteria = new ImportProfitLostCriteria
                {
                    Month = month.Value.DateTime,
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

        private DateTimeOffset? ExtractMonth(ExcelWorksheet worksheet)
        {
            var monthCell = worksheet.Cells[MonthCellRow, MonthCellCol].Value;
            var date = DateTimeHelper.ParseExcelDate(monthCell);
            var monthStart = DateTimeHelper.GetMonthStart(date);
            return monthStart.HasValue ? new DateTimeOffset(monthStart.Value, TimeSpan.Zero) : null;
        }

        private List<BUInfo> ExtractBUInfos(ExcelWorksheet worksheet)
        {
            var buInfos = new List<BUInfo>();
            var endCol = worksheet.Dimension?.End.Column ?? 0;

            for (var col = StartBUCol; col <= endCol; col++)
            {
                var codeCellValue = worksheet.Cells[BUCodeRow, col].Text.Trim();
                if (string.IsNullOrWhiteSpace(codeCellValue))
                {
                    continue;
                }

                // Extract GroupUnitId from code (e.g., "901OT" -> 901)
                var groupUnitId = ExtractGroupUnitIdFromCode(codeCellValue);
                if (groupUnitId == null)
                {
                    continue;
                }

                buInfos.Add(new BUInfo
                {
                    GroupUnitId = groupUnitId.Value,
                    Code = codeCellValue,
                    ColumnIndex = col
                });
            }

            return buInfos;
        }

        private static int? ExtractGroupUnitIdFromCode(string code)
        {
            // Extract numeric prefix from code (e.g., "901OT" -> 901)
            var numericPart = new StringBuilder();
            foreach (var c in code)
            {
                if (char.IsDigit(c))
                {
                    numericPart.Append(c);
                }
                else
                {
                    break;
                }
            }

            return int.TryParse(numericPart.ToString(), out var groupUnitId) ? groupUnitId : null;
        }

        private (List<TermItem>? Items, string? DuplicateTerm) ExtractProfitLost(ExcelWorksheet worksheet, List<BUInfo> buInfos)
        {
            var result = new List<TermItem>();
            var termNames = new HashSet<string>();
            var endRow = worksheet.Dimension?.End.Row ?? 0;

            for (var row = StartDataRow; row <= endRow; row++)
            {
                var metricName = worksheet.Cells[row, MetricCol].Text.Trim();
                if (string.IsNullOrWhiteSpace(metricName))
                {
                    continue;
                }

                if (!termNames.Add(metricName))
                {
                    return (null, metricName);
                }

                foreach (var buInfo in buInfos)
                {
                    var value = worksheet.Cells[row, buInfo.ColumnIndex].Text.Trim();

                    if (!decimal.TryParse(value, out var amount))
                    {
                        amount = 0;
                    }

                    result.Add(new TermItem
                    {
                        TermName = metricName,
                        Amount = amount,
                        GroupUnitId = buInfo.GroupUnitId
                    });
                }
            }

            return (result, null);
        }

        public async Task<ProfitLostReportResponse> GetConsolidateProfitLostAsync(DateTime month)
        {
            var criteria = new GetProfitLostCriteria
            {
                Month = month
            };
            var monthlyProfitLost = await baseService.GetDataAsync<MonthlyProfitLost>(criteria);

            var grouped = monthlyProfitLost
                .GroupBy(x => new { x.CategoryId, x.CategoryName, x.CategoryType })
                .Select(categoryGroup => new MonthlyProfitLostCategory
                {
                    CategoryId = categoryGroup.Key.CategoryId,
                    CategoryName = categoryGroup.Key.CategoryName,
                    CategoryType = categoryGroup.Key.CategoryType,
                    MonthlyTotalAmounts = categoryGroup
                        .GroupBy(x => x.BU)
                        .ToDictionary(
                            g => g.Key,
                            g => g.Sum(x => x.Amount)
                        ),
                    Details = categoryGroup
                        .GroupBy(x => new { x.TermId, x.TermName })
                        .Select(termGroup => new MonthlyProfitLostDetail
                        {
                            TermId = termGroup.Key.TermId,
                            TermName = termGroup.Key.TermName,
                            BUAmounts = termGroup
                                .GroupBy(x => x.BU)
                                .ToDictionary(
                                    g => g.Key,
                                    g => g.Sum(x => x.Amount)
                                )
                        })
                        .ToList()
                })
                .OrderBy(x => x.CategoryType)
                .ToList();

            // Calculate totals for each BU
            var allBUs = grouped
                .SelectMany(c => c.MonthlyTotalAmounts?.Keys ?? Enumerable.Empty<string>())
                .Distinct()
                .OrderBy(bu => bu)
                .ToList();

            var totals = new List<ProfitLostRow>();

            // Calculate Total Income (CategoryType = 2)
            var totalIncome = new ProfitLostRow
            {
                Name = "Total Income",
                BUAmounts = new Dictionary<string, decimal>()
            };

            // Calculate Gross Profit (Total Income - Direct Expense)
            var grossProfit = new ProfitLostRow
            {
                Name = "Gross Profit",
                BUAmounts = new Dictionary<string, decimal>()
            };

            // Calculate Net Profit (Gross Profit - Other Expense)
            var netProfit = new ProfitLostRow
            {
                Name = "Net Profit",
                BUAmounts = new Dictionary<string, decimal>()
            };

            foreach (var bu in allBUs)
            {
                var totalIncomeAmount = grouped
                    .Where(c => (CategoryType)c.CategoryType == CategoryType.Income)
                    .Sum(c => c.MonthlyTotalAmounts?.TryGetValue(bu, out var amount) == true ? amount : 0);

                var totalDirectExpense = grouped
                    .Where(c => (CategoryType)c.CategoryType == CategoryType.DirectExpense)
                    .Sum(c => c.MonthlyTotalAmounts?.TryGetValue(bu, out var amount) == true ? amount : 0);

                var totalOtherExpense = grouped
                    .Where(c => (CategoryType)c.CategoryType == CategoryType.OtherExpense)
                    .Sum(c => c.MonthlyTotalAmounts?.TryGetValue(bu, out var amount) == true ? amount : 0);

                totalIncome.BUAmounts[bu] = totalIncomeAmount;
                grossProfit.BUAmounts[bu] = totalIncomeAmount - totalDirectExpense;
                netProfit.BUAmounts[bu] = grossProfit.BUAmounts[bu] - totalOtherExpense;
            }

            totals.Add(totalIncome);
            totals.Add(grossProfit);
            totals.Add(netProfit);

            return new ProfitLostReportResponse
            {
                Categories = grouped,
                Totals = totals
            };
        }

        public async Task<CostExpenseReportResponse> GetUnitProfitLostAsync(int year, int groupUnitId)
        {
            var criteria = new GetProfitLostByUnitCriteria
            {
                Year = year,
                GroupUnitId = groupUnitId
            };
            var monthlyProfitLost = await baseService.GetDataAsync<MonthlyCostExpense>(criteria);

            var allYearMonths = GenerateYearMonths(year);
            var grouped = BuildCategories(monthlyProfitLost, allYearMonths);
            var totals = CalculateTotals(grouped, allYearMonths);

            return new CostExpenseReportResponse
            {
                Categories = grouped,
                Totals = totals
            };
        }

        private static List<string> GenerateYearMonths(int year)
        {
            return Enumerable.Range(1, 12)
                .Select(m => new DateTimeOffset(year, m, 1, 0, 0, 0, TimeSpan.Zero).ToString("MMM"))
                .ToList();
        }

        private static List<MonthlyCostExpenseCategory> BuildCategories(
            IEnumerable<MonthlyCostExpense> monthlyProfitLost,
            List<string> allYearMonths)
        {
            return monthlyProfitLost
                .GroupBy(x => new { x.CategoryId, x.CategoryName, x.CategoryType })
                .Select(categoryGroup =>
                {
                    var firstItem = categoryGroup.First();
                    var details = BuildCategoryDetails(categoryGroup, allYearMonths);
                    var monthlyTotalAmounts = CalculateMonthlyTotals(details, allYearMonths);

                    return new MonthlyCostExpenseCategory
                    {
                        CategoryId = firstItem.CategoryId,
                        CategoryName = firstItem.CategoryName,
                        CategoryType = firstItem.CategoryType,
                        MonthlyTotalAmounts = monthlyTotalAmounts,
                        Details = details
                    };
                })
                .OrderBy(x => x.CategoryType)
                .ToList();
        }

        private static List<MonthlyCostExpenseDetail> BuildCategoryDetails(
            IEnumerable<MonthlyCostExpense> categoryGroup,
            List<string> allYearMonths)
        {
            return categoryGroup
                .GroupBy(x => new { x.TermId, x.TermName })
                .Select(termGroup =>
                {
                    var firstItem = termGroup.First();
                    var monthlyAmounts = termGroup
                        .GroupBy(x => x.Month.ToString("MMM"))
                        .ToDictionary(
                            g => g.Key,
                            g => g.Sum(x => x.Amount)
                        );

                    var filledMonthlyAmounts = FillMissingMonths(monthlyAmounts, allYearMonths);

                    return new MonthlyCostExpenseDetail
                    {
                        TermId = firstItem.TermId,
                        TermName = firstItem.TermName,
                        MonthlyAmounts = filledMonthlyAmounts
                    };
                })
                .ToList();
        }

        private static Dictionary<string, decimal> FillMissingMonths(
            Dictionary<string, decimal> monthlyAmounts,
            List<string> allYearMonths)
        {
            var filledAmounts = new Dictionary<string, decimal>();
            foreach (var month in allYearMonths)
            {
                filledAmounts[month] = monthlyAmounts.TryGetValue(month, out var amount) ? amount : 0;
            }
            return filledAmounts;
        }

        private static Dictionary<string, decimal> CalculateMonthlyTotals(
            List<MonthlyCostExpenseDetail> details,
            List<string> allYearMonths)
        {
            var monthlyTotalAmounts = new Dictionary<string, decimal>();
            foreach (var month in allYearMonths)
            {
                monthlyTotalAmounts[month] = details
                    .Sum(d => d.MonthlyAmounts?.TryGetValue(month, out var amount) == true ? amount : 0);
            }
            return monthlyTotalAmounts;
        }

        private static List<UnitProfitLostRow> CalculateTotals(
            List<MonthlyCostExpenseCategory> grouped,
            List<string> allYearMonths)
        {
            var totalIncome = new UnitProfitLostRow
            {
                Name = "Total Income",
                MonthAmounts = new Dictionary<string, decimal>()
            };

            var grossProfit = new UnitProfitLostRow
            {
                Name = "Gross Profit",
                MonthAmounts = new Dictionary<string, decimal>()
            };

            var netProfit = new UnitProfitLostRow
            {
                Name = "Net Profit",
                MonthAmounts = new Dictionary<string, decimal>()
            };

            foreach (var monthKey in allYearMonths)
            {
                var amounts = CalculateMonthlyAmounts(grouped, monthKey);
                totalIncome.MonthAmounts[monthKey] = amounts.Income;
                grossProfit.MonthAmounts[monthKey] = amounts.Income - amounts.DirectExpense;
                netProfit.MonthAmounts[monthKey] = grossProfit.MonthAmounts[monthKey] - amounts.OtherExpense;
            }

            return new List<UnitProfitLostRow> { totalIncome, grossProfit, netProfit };
        }

        private static (decimal Income, decimal DirectExpense, decimal OtherExpense) CalculateMonthlyAmounts(
            List<MonthlyCostExpenseCategory> grouped,
            string monthKey)
        {
            var totalIncomeAmount = GetCategoryTotal(grouped, CategoryType.Income, monthKey);
            var totalDirectExpense = GetCategoryTotal(grouped, CategoryType.DirectExpense, monthKey);
            var totalOtherExpense = GetCategoryTotal(grouped, CategoryType.OtherExpense, monthKey);

            return (totalIncomeAmount, totalDirectExpense, totalOtherExpense);
        }

        private static decimal GetCategoryTotal(
            List<MonthlyCostExpenseCategory> grouped,
            CategoryType categoryType,
            string monthKey)
        {
            return grouped
                .Where(c => (CategoryType)c.CategoryType == categoryType)
                .Sum(c => c.MonthlyTotalAmounts?.TryGetValue(monthKey, out var amount) == true ? amount : 0);
        }


        public async Task<byte[]> ExportUnitProfitLostToExcelAsync(CostExpenseReportResponse response, int year, string unitnCode)
        {
            var templatePath = Path.Combine(hostingEnvironment.ContentRootPath, UnitProfitLostExportTemplate);

            await using var templateStream = new FileStream(templatePath, FileMode.Open, FileAccess.Read);
            using var templatePackage = new ExcelPackage(templateStream);
            using var outputPackage = new ExcelPackage();

            var templateSheet = templatePackage.Workbook.Worksheets[0];
            var sheet = outputPackage.Workbook.Worksheets.Add("BU P&L", templateSheet);

            const string buCell = "B1";
            sheet.Cells[buCell].Value = $"BU: {unitnCode}";

            const string yearCell = "B2";
            sheet.Cells[yearCell].Value = $"YEAR: {year}";

            var termRowMap = MapTermFromTemplate(sheet);
            var buColMap = MapMonthFromTemplate(sheet);

            var allRows = new List<ProfitLostRow>();

            allRows.AddRange(
                response.Categories
                    .SelectMany(c => c.Details)
                    .Select(d => new ProfitLostRow
                    {
                        Name = d.TermName,
                        BUAmounts = d.MonthlyAmounts
                    })
            );

            allRows.AddRange(
                response.Categories
                    .Where(c => c.MonthlyTotalAmounts != null)
                    .Select(c => new ProfitLostRow
                    {
                        Name = c.CategoryName,
                        BUAmounts = c.MonthlyTotalAmounts
                    })
            );

            allRows.AddRange(
                response.Totals.Select(t => new ProfitLostRow
                {
                    Name = t.Name,
                    BUAmounts = t.MonthAmounts
                })
            );


            foreach (var detail in allRows)
            {
                string key = detail.Name;

                if (!termRowMap.TryGetValue(key, out int targetRow))
                {
                    continue;
                }


                foreach (var bu in detail.BUAmounts)
                {
                    var buKey = bu.Key;

                    if (!buColMap.TryGetValue(buKey, out int col))
                    {
                        continue;
                    }

                    sheet.Cells[targetRow, col].Value = bu.Value;
                }
            }

            // Freeze first 4 rows
            sheet.View.FreezePanes(5, 1);

            await using var ms = new MemoryStream();
            await outputPackage.SaveAsAsync(ms);
            return ms.ToArray();
        }

        public async Task<byte[]> ExportProfitLostToExcelAsync(ProfitLostReportResponse response, DateTime month)
        {
            var templatePath = Path.Combine(hostingEnvironment.ContentRootPath, ProfitLostExportTemplate);

            await using var templateStream = new FileStream(templatePath, FileMode.Open, FileAccess.Read);
            using var templatePackage = new ExcelPackage(templateStream);
            using var outputPackage = new ExcelPackage();

            var templateSheet = templatePackage.Workbook.Worksheets[0];
            var sheet = outputPackage.Workbook.Worksheets.Add("BU P&L", templateSheet);

            const string monthCell = "C1";
            sheet.Cells[monthCell].Value = month;

            var termRowMap = MapTermFromTemplate(sheet);
            var buColMap = MapBUFromTemplate(sheet);

            var allRows = new List<ProfitLostRow>();

            allRows.AddRange(
                response.Categories
                    .SelectMany(c => c.Details)
                    .Select(d => new ProfitLostRow
                    {
                        Name = d.TermName,
                        BUAmounts = d.BUAmounts
                    })
            );

            allRows.AddRange(
                response.Categories
                    .Where(c => c.MonthlyTotalAmounts != null)
                    .Select(c => new ProfitLostRow
                    {
                        Name = c.CategoryName,
                        BUAmounts = c.MonthlyTotalAmounts
                    })
            );

            allRows.AddRange(
                response.Totals.Select(t => new ProfitLostRow
                {
                    Name = t.Name,
                    BUAmounts = t.BUAmounts
                })
            );


            foreach (var detail in allRows)
            {
                string key = detail.Name;

                if (!termRowMap.TryGetValue(key, out int targetRow))
                {
                    continue;
                }


                foreach (var bu in detail.BUAmounts)
                {
                    var buKey = NormalizeKey(bu.Key);

                    if (!buColMap.TryGetValue(buKey, out int col))
                    {
                        continue;
                    }

                    sheet.Cells[targetRow, col].Value = bu.Value;
                }
            }

            // Freeze first 2 columns
            sheet.View.FreezePanes(1, 3);


            await using var ms = new MemoryStream();
            await outputPackage.SaveAsAsync(ms);
            return ms.ToArray();
        }

        private static Dictionary<string, int> MapTermFromTemplate(ExcelWorksheet sheet)
        {
            const int termCol = 2;        // B column
            const int startRow = 5;       // B6
            const int endRow = 139;       // B139

            var termRowMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            for (int row = startRow; row <= endRow; row++)
            {
                string? cellValue = sheet.Cells[row, termCol].Text?.Trim();
                if (!string.IsNullOrWhiteSpace(cellValue))
                {
                    string key = cellValue;
                    if (!termRowMap.ContainsKey(key))
                    {
                        termRowMap[key] = row;
                    }

                }
            }

            return termRowMap;
        }

        private static Dictionary<string, int> MapBUFromTemplate(ExcelWorksheet sheet)
        {
            const int headerRow = 5; // BU headers row
            var buColMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            for (int col = 1; col <= sheet.Dimension.End.Column; col++)
            {
                var val = sheet.Cells[headerRow, col].Text?.Trim();
                if (!string.IsNullOrWhiteSpace(val))
                {
                    buColMap[NormalizeKey(val)] = col;
                }

            }

            return buColMap;
        }

        private static Dictionary<string, int> MapMonthFromTemplate(ExcelWorksheet sheet)
        {
            const int headerRow = 4; // Month headers row
            var monthColMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            for (int col = 1; col <= sheet.Dimension.End.Column; col++)
            {
                var val = sheet.Cells[headerRow, col].Text?.Trim();
                if (!string.IsNullOrWhiteSpace(val))
                {
                    monthColMap[val] = col;
                }

            }

            return monthColMap;
        }

        private static string NormalizeKey(string input)
        {
            return input?
                .Replace(" ", "")
                .Replace("-", "")
                .Trim()
                .ToUpperInvariant() ?? "";
        }
    }

    internal class BUInfo
    {
        internal int GroupUnitId { get; set; }
        internal string Code { get; set; } = string.Empty;
        internal int ColumnIndex { get; set; }
    }
}
