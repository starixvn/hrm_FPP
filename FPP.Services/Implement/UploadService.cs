using FPP.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;

namespace FPP.Services.Implement
{
    public class UploadService : IUploadService
    {
        private const int SheetIndex = 4;
        private const int StartItemRow = 8;
        private const int MonthRow = 2;
        private const int StartMonthCol = 3; // Column C 
        private const int EndMonthCol = 14; // Column L
        private const int NameCol = 2; // Column B
        private const int MinLengthBuCode = 3;
        private const int BuCellRow = 1;
        private const int BuCellCol = 2;

        public async Task<bool> ImportBUCostExcelAsync(IFormFile file)
        {
            await using var stream = file.OpenReadStream();
            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets[SheetIndex];

            var buId = ExtractBUId(worksheet);
            if (buId == null)
            {
                return false;
            }

            var months = ExtractMonths(worksheet);
            var result = ExtractExpenses(worksheet, buId.Value, months);

            return true;
        }

        private int? ExtractBUId(ExcelWorksheet worksheet)
        {
            var buCell = worksheet.Cells[BuCellRow, BuCellCol].Text;
            if (buCell.Length < MinLengthBuCode)
            {
                return null;
            }

            var buCode = buCell[..MinLengthBuCode];
            return int.TryParse(buCode, out var buId) ? buId : null;
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

        private List<ExtractedExpense> ExtractExpenses(ExcelWorksheet worksheet, int buId, List<DateTime> months)
        {
            var result = new List<ExtractedExpense>();
            var itemsBuffer = new List<string>();
            var firstItemRow = StartItemRow;

            var categoryList = new HashSet<string>
        {
            "Communication Exp",
            "Cost of Sales Exp",
            "Establishment Exp",
            "Personnel Exp",
            "Marketing Exp",
            "General & Admin Exp",
            "Finance Exp",
            "Tax Exp",
            "Forex"
        };

            for (var row = StartItemRow; row <= worksheet.Dimension.End.Row; row++)
            {
                var cellText = worksheet.Cells[row, NameCol].Text.Trim();
                if (string.IsNullOrWhiteSpace(cellText))
                {
                    continue;
                }
                if (!categoryList.Contains(cellText))
                {
                    if (itemsBuffer.Count == 0)
                    {
                        firstItemRow = row;
                    }

                    itemsBuffer.Add(cellText);
                    continue;
                }
                foreach (var itemName in itemsBuffer)
                {
                    var itemRow = firstItemRow + itemsBuffer.IndexOf(itemName);
                    for (var i = 0; i < months.Count; i++)
                    {
                        var col = StartMonthCol + i;
                        var value = worksheet.Cells[itemRow, col].Text;
                        var amount = decimal.TryParse(value, out var a) ? a : 0;

                        result.Add(new ExtractedExpense
                        {
                            BUId = buId,
                            Category = cellText,
                            Item = itemName,
                            Month = new DateTime(months[i].Year, months[i].Month, 1),
                            Amount = amount
                        });
                    }
                }
                itemsBuffer.Clear();
                // TODO: handle summary if needed
            }

            return result;
        }


        public class ExtractedExpense
        {
            public int BUId { get; set; }
            public string Category { get; set; }
            public string Item { get; set; }
            public DateTime Month { get; set; }
            public decimal Amount { get; set; }
        }
    }
}
