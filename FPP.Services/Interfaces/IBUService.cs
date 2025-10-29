using FPP.Models.InterInvoice;

namespace FPP.Services.Interfaces
{
    public interface IBUService
    {
        Task<List<BUInvoiceSummaryModel>> GetBUInvoiceSummaryAsync(DateTime month, int buId);
        Task<byte[]> ExportBUInvoiceSummaryToExcelAsync(DateTime month, int buId);
    }
}
