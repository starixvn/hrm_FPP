using FPP.Core.Models;
using FPP.Core.Services;
using FPP.Criteria;
using FPP.Models;
using FPP.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using OfficeOpenXml;

namespace FPP.Services.Implement
{
    public class UploadService(
        IBaseService baseService) : IUploadService
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
                if (monthInfos == null || monthInfos.Count == 0)
                {
                    commandResult.Message = "Could not extract months from the worksheet";
                    return commandResult;
                }

                var items = ExtractExpenses(worksheet, monthInfos);
                if (items == null || items.Count == 0)
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
                var header = worksheet.Cells[MonthRow, col].Text;
                if (string.IsNullOrWhiteSpace(header))
                {
                    continue;
                }

                if (DateTime.TryParse(header, out var month) ||
                    DateTime.TryParseExact(header, "MM-yy", null, System.Globalization.DateTimeStyles.None, out month))
                {
                    monthInfos.Add(new MonthInfo
                    {
                        Month = month,
                        ColumnIndex = col
                    });
                }
            }
            return monthInfos;
        }

        private List<TermItem> ExtractExpenses(ExcelWorksheet worksheet, List<MonthInfo> monthInfos)
        {
            var result = new List<TermItem>();

            for (var row = StartItemRow; row <= worksheet.Dimension.End.Row; row++)
            {
                var cellText = worksheet.Cells[row, NameCol].Text.Trim();
                if (string.IsNullOrWhiteSpace(cellText))
                {
                    continue;
                }

                foreach (var monthInfo in monthInfos)
                {
                    var value = worksheet.Cells[row, monthInfo.ColumnIndex].Text;
                    var amount = decimal.TryParse(value, out var a) ? a : 0;

                    result.Add(new TermItem
                    {
                        TermName = cellText,
                        Month = new DateTime(monthInfo.Month.Year, monthInfo.Month.Month, 1),
                        Amount = amount
                    });
                }
            }
            return result;
        }
    }
}
