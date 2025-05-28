using FPP.Models.InterInvoice;

namespace FPP.Services.Interfaces
{
    public interface IInterInvoiceService
    {
        Task<InterInvoiceDetail> GetInterInvoiceById(int id, bool isEdit, int editedBy);
    }
}
