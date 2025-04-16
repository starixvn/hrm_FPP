using FPP.Core.Models;
using FPP.Core.Services;
using FPP.Criteria;
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
            await using var stream = file.OpenReadStream();
            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets[SheetIndex];

            var groupUnitId = ExtractGroupUnitId(worksheet);
            if (groupUnitId == null)
            {
                return commandResult;
            }

            var months = ExtractMonths(worksheet);
            var items = ExtractExpenses(worksheet, months);

            var criteria = new ImportCostExpenseCriteria
            {
                GroupUnitId = groupUnitId.Value,
                FileName = file.FileName,
                SavedFileName = savedFileName,
                CreatedBy = userId,
                TermListJson = JsonConvert.SerializeObject(items),
            };

            commandResult = await baseService.ExecuteNonQueryAsync(criteria);
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

        private List<DateTime> ExtractMonths(ExcelWorksheet worksheet)
        {
            var months = new List<DateTime>();
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
                    months.Add(month);
                }
                else
                {
                    months.Add(DateTime.MinValue);
                }
            }
            return months;
        }

        private List<TermItem> ExtractExpenses(ExcelWorksheet worksheet, List<DateTime> months)
        {
            var result = new List<TermItem>();

            for (var row = StartItemRow; row <= worksheet.Dimension.End.Row; row++)
            {
                var cellText = worksheet.Cells[row, NameCol].Text.Trim();
                if (string.IsNullOrWhiteSpace(cellText))
                {
                    continue;
                }
                for (var i = 0; i < months.Count; i++)
                {
                    var col = StartMonthCol + i;
                    var value = worksheet.Cells[row, col].Text;
                    var amount = decimal.TryParse(value, out var a) ? a : 0;

                    result.Add(new TermItem
                    {
                        TermName = cellText,
                        Month = new DateTime(months[i].Year, months[i].Month, 1),
                        Amount = amount
                    });
                }
            }
            return result;
        }
    }
}
