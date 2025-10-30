using System.Security.Cryptography.Xml;
using FPP.Core.Criteria.ProfitLost;
using FPP.Core.Models;
using FPP.Core.Services;
using FPP.Models.ProfitLost;
using FPP.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using OfficeOpenXml;

namespace FPP.Services.Implement
{
    public class ProfitLostService(
        IBaseService baseService) : IProfitLostService
    {
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
                    Month = month.Value,
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

        private DateTime? ExtractMonth(ExcelWorksheet worksheet)
        {
            var monthCellValue = worksheet.Cells[MonthCellRow, MonthCellCol].Text.Trim();
            if (string.IsNullOrWhiteSpace(monthCellValue))
            {
                return null;
            }

            // Parse format like "2025 AUG"
            var parts = monthCellValue.Split([' '], StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length < 2)
            {
                return null;
            }

            if (!int.TryParse(parts[0], out var year))
            {
                return null;
            }

            var monthAbbr = parts[1].ToUpper();
            var monthNames = new Dictionary<string, int>
            {
                { "JAN", 1 }, { "FEB", 2 }, { "MAR", 3 }, { "APR", 4 },
                { "MAY", 5 }, { "JUN", 6 }, { "JUL", 7 }, { "AUG", 8 },
                { "SEP", 9 }, { "OCT", 10 }, { "NOV", 11 }, { "DEC", 12 }
            };

            if (!monthNames.TryGetValue(monthAbbr, out var month))
            {
                return null;
            }

            return new DateTime(year, month, 1);
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
            var numericPart = string.Empty;
            foreach (var c in code)
            {
                if (char.IsDigit(c))
                {
                    numericPart += c;
                }
                else
                {
                    break;
                }
            }

            return int.TryParse(numericPart, out var groupUnitId) ? groupUnitId : null;
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

        public async Task<IEnumerable<MonthlyProfitLostCategory>> GetProfitLostExcelAsync(DateTime month)
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

            return grouped;
        }

    }

    internal class BUInfo
    {
        public int GroupUnitId { get; set; }
        public string Code { get; set; } = string.Empty;
        public int ColumnIndex { get; set; }
    }
}
