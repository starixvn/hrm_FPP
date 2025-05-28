using FPP.Models.InterInvoice;

namespace FPP.Services.Interfaces
{
    public interface IInterInvoiceService
    {
        Task<InterInvoice> GetInterInvoiceById(int id);
    }
}
