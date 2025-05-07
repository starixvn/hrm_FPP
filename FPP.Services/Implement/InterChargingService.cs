using FPP.Core.Criteria.InterCharging;
using FPP.Core.Models;
using FPP.Core.Services;
using FPP.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using OfficeOpenXml;
using FPP.Core.Helpers;

namespace FPP.Services.Implement
{
    public class InterChargingService(
        IBaseService baseService) : IInterChargingService
    {
        private const int SheetIndex = 0;
        private const int StartDataRow = 11; // Row where data starts (after headers)
        private const int BUIdCol = 2;       // Column B
        private const int DescriptionCol = 8; // Column H
        private const int AmountCol = 9;     // Column G
        private const int ReportBUIdRow = 4; // Row containing "REPORT BY (BU ID)"
        private const int ReportBUIdCol = 3;  // Column B for BU ID value
        private const int PeriodMonthRow = 5; // Row containing "PERIOD/MONTH"
        private const int PeriodMonthCol = 3; // Column C for Period/Month value
        private const int TotalRow = 49;     // Row containing "TOTAL"
        private const int TotalCol = 9;      // Column I for Total value

        public async Task<CommandResult> ImportInterChargingExcelAsync(IFormFile file, string savedFileName, int userId)
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

                var ownerGroupUnitId = ExtractOwnerGroupUnitId(worksheet);
                if (!ownerGroupUnitId.HasValue)
                {
                    commandResult.Message = "Could not extract Report BU ID from the worksheet";
                    return commandResult;
                }

                var month = ExtractMonth(worksheet);
                if (!month.HasValue)
                {
                    commandResult.Message = "Could not extract Period/Month from the worksheet";
                    return commandResult;
                }

                var chargedItems = ExtractChargedItems(worksheet);
                if (chargedItems.Count == 0)
                {
                    commandResult.Message = "Could not extract charging data from the worksheet";
                    return commandResult;
                }

                var totalAmount = chargedItems.Sum(x => x.Amount);
                if (totalAmount != 0)
                {
                    commandResult.Message = "The sum of all charged amounts must be zero. Please check your input data.";
                    return commandResult;
                }

                var excelTotal = GetExcelTotal(worksheet);
                if (excelTotal != 0)
                {
                    commandResult.Message = "The total amount in the Excel sheet must be zero. Please check cell I49.";
                    return commandResult;
                }

                var criteria = new ImportInterChargingCriteria
                {
                    GroupUnitId = ownerGroupUnitId.Value,
                    FileName = file.FileName,
                    SavedFileName = savedFileName,
                    CreatedBy = userId,
                    Month = month.Value,
                    ChargedListJson = JsonConvert.SerializeObject(chargedItems)
                };

                commandResult = await baseService.ExecuteNonQueryAsync(criteria);
            }
            catch (Exception ex)
            {
                commandResult.Message = $"Error processing Excel file: {ex.Message}";
            }

            return commandResult;
        }

        private int? ExtractOwnerGroupUnitId(ExcelWorksheet worksheet)
        {
            var buIdCell = worksheet.Cells[ReportBUIdRow, ReportBUIdCol].Text.Trim();
            return int.TryParse(buIdCell, out var buId) ? buId : null;
        }

        private DateTime? ExtractMonth(ExcelWorksheet worksheet)
        {
            var monthCell = worksheet.Cells[PeriodMonthRow, PeriodMonthCol].Value;
            var date = DateTimeHelper.ParseExcelDate(monthCell);

            return date;
        }

        private decimal GetExcelTotal(ExcelWorksheet worksheet)
        {
            var totalCell = worksheet.Cells[TotalRow, TotalCol].Text.Trim();
            return decimal.TryParse(totalCell, out var total) ? total : 0;
        }

        private List<ChargedItem> ExtractChargedItems(ExcelWorksheet worksheet)
        {
            var items = new List<ChargedItem>();
            var currentRow = StartDataRow;

            while (currentRow <= worksheet.Dimension.End.Row)
            {
                var buIdText = worksheet.Cells[currentRow, BUIdCol].Text.Trim();
                var amount = worksheet.Cells[currentRow, AmountCol].Text.Trim();
                var description = worksheet.Cells[currentRow, DescriptionCol].Text.Trim();

                // Stop if we hit an empty row
                if (string.IsNullOrEmpty(buIdText))
                {
                    break;
                }

                if (int.TryParse(buIdText, out var buId) &&
                    decimal.TryParse(amount, out var amountValue) &&
                    amountValue != 0)
                {
                    items.Add(new ChargedItem
                    {
                        ChargedGroupUnitId = buId,
                        Amount = amountValue,
                        Remark = description
                    });
                }

                currentRow++;
            }

            return items;
        }
    }
}
