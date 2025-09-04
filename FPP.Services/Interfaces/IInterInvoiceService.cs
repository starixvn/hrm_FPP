using FPP.Models.InterInvoice;

namespace FPP.Services.Interfaces
{
    public interface IInterInvoiceService
    {
        Task<InterInvoiceDetail> GetInterInvoiceById(int id, int currentUserId, bool isEdit, bool isGlobal);

        Task<List<InterInvoiceReportModel>> GetReportGroupedByPayerAsync(DateTime month);
    }
}
