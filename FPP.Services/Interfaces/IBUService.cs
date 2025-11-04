using FPP.Models.BU;

namespace FPP.Services.Interfaces
{
    public interface IBUService
    {
        Task<List<BUInvoiceSummaryModel>> GetBUInvoiceSummaryAsync(DateTime month, int buId);
        Task<byte[]> ExportBUInvoiceSummaryToExcelAsync(DateTime month, int buId);
    }
}
