using FPP.Core.Criteria.InterInvoice;
using FPP.Core.Enums;
using FPP.Core.Helpers;
using FPP.Core.Services;
using FPP.Models.InterInvoice;
using FPP.Services.Interfaces;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace FPP.Services.Implement
{
    public class InterInvoiceService(IBaseService baseService) : IInterInvoiceService
    {
        public async Task<InterInvoiceDetail> GetInterInvoiceById(int id, int currentUserId, bool isEdit, bool isGlobal)
        {
            var criteria = new GetInterInvoiceCriteria
            {
                InterInvoiceId = id,
                CurrentEmpId = currentUserId,
                IsEdit = isEdit,
                IsGlobal = isGlobal
            };
            var (invoices, items) = await baseService.FetchMultipleAsync<InterInvoiceDetail, InterInvoiceItem>(criteria);

            var invoice = invoices.FirstOrDefault();
            if (invoice != null)
            {
                invoice.Items = items.Where(i => i.InterInvoiceId == invoice.InterInvoiceId).ToList();
            }

            return invoice ?? new InterInvoiceDetail();
        }

        public async Task<List<InterInvoiceReportModel>> GetReportGroupedByPayerAsync(DateTime month)
        {
            var balances = await baseService.GetDataAsync<InterInvoiceReport>(new GetInterInvoiceReportCriteria { Month = month });

            var payerGroups = balances
                .GroupBy(x => new
                {
                    x.PayerGroupId,
                    x.PayerCode,
                    x.PayerCategory,
                    x.PayerType,
                    x.PayerAccountableArea,
                    x.PayerPicName
                })
                .Select(g => new InterInvoiceReportModel
                {
                    BuId = g.Key.PayerGroupId,
                    BuCode = g.Key.PayerCode,
                    BuCategory = g.Key.PayerCategory,
                    BuType = g.Key.PayerType,
                    AccountableArea = g.Key.PayerAccountableArea,
                    BuPicName = g.Key.PayerPicName,
                    Units = [.. g.Select(x => new UnitData
                    {
                        Id = x.BillerGroupId,
                        Code = x.BillerCode,
                        Value = x.Balance,
                        CurrencySymbol = x.CurrencySymbol
                    })]
                })
                .ToList();

            return payerGroups;
        }

        public async Task<byte[]> ExportInvoiceReportToExcelAsync(DateTime month)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            var reportData = await GetReportGroupedByPayerAsync(month);

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Inter Invoice Report");

            WriteTotalRow(reportData, worksheet);
            WriteHeaders(reportData, worksheet);
            WriteDataRows(reportData, worksheet);

            worksheet.View.FreezePanes(3, 6);

            worksheet.Cells.AutoFitColumns();

            return await package.GetAsByteArrayAsync();
        }

        private static void WriteTotalRow(List<InterInvoiceReportModel> reportData, ExcelWorksheet worksheet)
        {
            const int totalRow = 1;
            var fromCol = 6; // Skip BU Category, BU Type, Accountable Area, BU PIC Name columns
            var totalCell = worksheet.Cells[totalRow, fromCol - 1];
            totalCell.Value = "Total";
            totalCell.Style.Font.Bold = true;

            if (reportData.Count <= 0 || reportData[0].Units.Count <= 0)
            {
                return;
            }
            for (var unitIndex = 0; unitIndex < reportData[0].Units.Count; unitIndex++)
            {
                var totalValue = reportData.Sum(r => r.Units[unitIndex].Value);
                var cell = worksheet.Cells[totalRow, fromCol++];
                cell.Value = totalValue;
                cell.Style.Font.Bold = true;
                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
                cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                if (totalValue < 0)
                {
                    cell.Style.Font.Color.SetColor(System.Drawing.Color.Red);
                }
            }
        }

        private static void WriteDataRows(List<InterInvoiceReportModel> reportData, ExcelWorksheet worksheet)
        {
            for (var row = 0; row < reportData.Count; row++)
            {
                var data = reportData[row];
                var col = 1;
                var dataRow = row + 3; // Start from row 3 (after total and headers)

                worksheet.Cells[dataRow, col++].Value = $"{data.BuId} - {data.BuCode}";
                worksheet.Cells[dataRow, col++].Value = data.BuCategory;
                worksheet.Cells[dataRow, col++].Value = data.BuType;
                worksheet.Cells[dataRow, col++].Value = data.AccountableArea;
                worksheet.Cells[dataRow, col++].Value = data.BuPicName;
                var unitValues = data.Units.Select(unit => unit.Value).ToList();
                foreach (var value in unitValues)
                {
                    var cell = worksheet.Cells[dataRow, col++];
                    cell.Value = value;
                    cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                    if (value < 0)
                    {
                        cell.Style.Font.Color.SetColor(System.Drawing.Color.Red);
                    }
                }
            }
        }

        private static void WriteHeaders(List<InterInvoiceReportModel> reportData, ExcelWorksheet worksheet)
        {
            var headers = new List<string> { "BU", "BU Category", "BU Type", "Accountable Area", "BU PIC Name" };
            if (reportData.Count > 0 && reportData[0].Units.Count > 0)
            {
                headers.AddRange(reportData[0].Units.Select(unit => unit.Name));
            }

            for (var i = 0; i < headers.Count; i++)
            {
                var cell = worksheet.Cells[2, i + 1]; // Row 2 for headers
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }
        }

        public async Task<byte[]> ExportInterInvoiceToExcelAsync(IEnumerable<InterInvoiceList> interInvoices)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Inter Invoice Report");

            WriteInterInvoiceHeaders(worksheet);
            WriteInterInvoiceDataRows(worksheet, interInvoices);

            worksheet.View.FreezePanes(2, 1);

            worksheet.Cells.AutoFitColumns();

            return await package.GetAsByteArrayAsync();
        }

        private static void WriteInterInvoiceHeaders(ExcelWorksheet worksheet)
        {
            var headers = new List<string> { "Invoice ID", "Biller", "Receiver", "Total Amount", "Currency", "Handler", "Period Type", "Created Date", "Created By", "Status" };

            for (var i = 0; i < headers.Count; i++)
            {
                var cell = worksheet.Cells[1, i + 1];
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }
        }

        private static void WriteInterInvoiceDataRows(ExcelWorksheet worksheet, IEnumerable<InterInvoiceList> interInvoices)
        {
            var rowIndex = 2;
            foreach (var interInvoice in interInvoices)
            {
                var colIndex = 1;

                worksheet.Cells[rowIndex, colIndex++].Value = interInvoice.InterInvoiceId;
                worksheet.Cells[rowIndex, colIndex++].Value = interInvoice.BillerUnitCode;
                worksheet.Cells[rowIndex, colIndex++].Value = interInvoice.PayerUnitCode;
                worksheet.Cells[rowIndex, colIndex++].Value = interInvoice.TotalAmount;
                worksheet.Cells[rowIndex, colIndex++].Value = interInvoice.Currency;
                worksheet.Cells[rowIndex, colIndex++].Value = interInvoice.Handler;
                worksheet.Cells[rowIndex, colIndex++].Value = interInvoice.FromDate.ToString("MMM, yyyy");
                worksheet.Cells[rowIndex, colIndex++].Value = interInvoice.CreatedDate?.ToString("dd MMM, yyyy HH:mm");
                worksheet.Cells[rowIndex, colIndex++].Value = interInvoice.CreatedBy;
                worksheet.Cells[rowIndex, colIndex].Value = ((InterInvoiceStatus)interInvoice.Status).GetDescription();

                rowIndex++;
            }
        }
    }
}
