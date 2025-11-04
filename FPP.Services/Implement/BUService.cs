using FPP.Core.Criteria.BU;
using FPP.Core.Services;
using FPP.Models.BU;
using FPP.Services.Interfaces;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace FPP.Services.Implement
{
    public class BUService(IBaseService baseService) : IBUService
    {
        public async Task<List<BUInvoiceSummaryModel>> GetBUInvoiceSummaryAsync(
            DateTime month,
            int buId
        )
        {
            var criteria = new GetBUInvoiceSummaryCriteria { Month = month, BUId = buId };
            var result = await baseService.GetDataAsync<BUInvoiceSummaryModel>(criteria);
            return result.ToList();
        }

        public async Task<byte[]> ExportBUInvoiceSummaryToExcelAsync(DateTime month, int buId)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            var reportData = await GetBUInvoiceSummaryAsync(month, buId);

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("BU Invoice Summary");

            WriteTotalRow(reportData, worksheet);
            WriteHeaders(worksheet);
            WriteDataRows(reportData, worksheet);

            worksheet.View.FreezePanes(4, 1);

            int[] columnWidths = [15, 15, 28, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18];
            for (int i = 0; i < columnWidths.Length; i++)
            {
                worksheet.Column(i + 1).Width = columnWidths[i];
            }

            return await package.GetAsByteArrayAsync();
        }

        private static void WriteHeaders(ExcelWorksheet worksheet)
        {
            var baseHeaders = new[] { "BU ID", "BU Code", "Accountable Area", "BU PIC Name" };
            var headerGroups = new[]
            {
                new { Title = "Confirmed", Color = System.Drawing.Color.FromArgb(115, 209, 61) },
                new { Title = "Pending", Color = System.Drawing.Color.FromArgb(255, 197, 61) },
                new { Title = "Rejected", Color = System.Drawing.Color.FromArgb(255, 77, 79) },
            };
            var subHeaders = new[] { "Income", "Expense", "Net" };
            var headerBgColor = System.Drawing.Color.FromArgb(82, 115, 165);
            var borderColor = System.Drawing.Color.FromArgb(200, 200, 200);

            for (int i = 0; i < baseHeaders.Length; i++)
            {
                var cell = worksheet.Cells[1, i + 1, 2, i + 1];
                cell.Merge = true;
                cell.Value = baseHeaders[i];
                ApplyHeaderStyle(
                    cell,
                    headerBgColor,
                    System.Drawing.Color.White,
                    borderColor,
                    bold: true
                );
            }

            int col = 5;
            foreach (var group in headerGroups)
            {
                var mainCell = worksheet.Cells[1, col, 1, col + 2];
                mainCell.Merge = true;
                mainCell.Value = group.Title;
                ApplyHeaderStyle(
                    mainCell,
                    headerBgColor,
                    group.Color,
                    borderColor,
                    bold: true
                );

                for (int j = 0; j < subHeaders.Length; j++)
                {
                    var subCell = worksheet.Cells[2, col + j];
                    subCell.Value = subHeaders[j];
                    ApplyHeaderStyle(
                        subCell,
                        headerBgColor,
                        System.Drawing.Color.White,
                        borderColor,
                        bold: true
                    );
                }
                col += 3;
            }
        }

        private static void ApplyHeaderStyle(
            ExcelRange cell,
            System.Drawing.Color bg,
            System.Drawing.Color fg,
            System.Drawing.Color border,
            bool bold
        )
        {
            cell.Style.Font.Bold = bold;
            cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
            cell.Style.Fill.BackgroundColor.SetColor(bg);
            cell.Style.Font.Color.SetColor(fg);
            cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            cell.Style.Border.Top.Style = ExcelBorderStyle.Thin;
            cell.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            cell.Style.Border.Left.Style = ExcelBorderStyle.Thin;
            cell.Style.Border.Right.Style = ExcelBorderStyle.Thin;
            cell.Style.Border.Top.Color.SetColor(border);
            cell.Style.Border.Bottom.Color.SetColor(border);
            cell.Style.Border.Left.Color.SetColor(border);
            cell.Style.Border.Right.Color.SetColor(border);
        }

        private static void WriteDataRows(
            List<BUInvoiceSummaryModel> data,
            ExcelWorksheet worksheet
        )
        {
            int row = 4;
            foreach (var record in data)
            {
                worksheet.Cells[row, 1].Value = record.BUId;
                worksheet.Cells[row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                worksheet.Cells[row, 2].Value = record.BUCode;
                worksheet.Cells[row, 3].Value = record.AccountableArea;
                worksheet.Cells[row, 4].Value = record.BUPICName;

                var groups = new (decimal income, decimal expense)[]
                {
                    (record.ConfirmedIncome, record.ConfirmedExpense),
                    (record.PendingIncome, record.PendingExpense),
                    (record.RejectedIncome, record.RejectedExpense),
                };

                int col = 5;
                foreach (var (income, expense) in groups)
                {
                    worksheet.Cells[row, col].Value = income;
                    worksheet.Cells[row, col + 1].Value = expense > 0 ? -expense : expense;
                    worksheet.Cells[row, col + 2].Value = income - expense;

                    for (int i = 0; i < 3; i++)
                    {
                        var cell = worksheet.Cells[row, col + i];
                        cell.Style.Numberformat.Format = "#,##0";
                        cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                        if (Convert.ToDecimal(cell.Value) < 0)
                        {
                            cell.Style.Font.Color.SetColor(System.Drawing.Color.Red);
                        }
                    }
                    col += 3;
                }
                row++;
            }
        }

        private static void WriteTotalRow(
            List<BUInvoiceSummaryModel> data,
            ExcelWorksheet worksheet
        )
        {
            if (data.Count == 0)
            {
                return;
            }

            const int totalRow = 3;
            worksheet.Cells[totalRow, 1, totalRow, 4].Merge = true;
            worksheet.Cells[totalRow, 1].Value = "Total";
            worksheet.Cells[totalRow, 1].Style.Font.Bold = true;
            worksheet.Cells[totalRow, 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
            worksheet
                .Cells[totalRow, 1]
                .Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(245, 245, 245));
            worksheet.Cells[totalRow, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

            var totals = new[]
            {
                (data.Sum(x => x.ConfirmedIncome), data.Sum(x => x.ConfirmedExpense)),
                (data.Sum(x => x.PendingIncome), data.Sum(x => x.PendingExpense)),
                (data.Sum(x => x.RejectedIncome), data.Sum(x => x.RejectedExpense)),
            };

            int col = 5;
            foreach (var (income, expense) in totals)
            {
                worksheet.Cells[totalRow, col].Value = income;
                worksheet.Cells[totalRow, col + 1].Value = expense > 0 ? -expense : expense;
                worksheet.Cells[totalRow, col + 2].Value = income - expense;

                for (int i = 0; i < 3; i++)
                {
                    var cell = worksheet.Cells[totalRow, col + i];
                    cell.Style.Numberformat.Format = "#,##0";
                    cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                    cell.Style.Font.Bold = true;
                    cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    cell.Style.Fill.BackgroundColor.SetColor(
                        System.Drawing.Color.FromArgb(245, 245, 245)
                    );
                    if (Convert.ToDecimal(cell.Value) < 0)
                    {
                        cell.Style.Font.Color.SetColor(System.Drawing.Color.Red);
                    }
                }
                col += 3;
            }
        }
    }
}
