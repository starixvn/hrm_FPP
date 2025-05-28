using Fanex.Data;
using FPP.Core.Criteria.InterInvoice;
using FPP.Models.InterInvoice;
using FPP.Services.Interfaces;

namespace FPP.Services.Implement
{
    public class InterInvoiceService() : IInterInvoiceService
    {
        public async Task<InterInvoiceDetail> GetInterInvoiceById(int id, bool isEdit, int editedBy)
        {
            var criteria = new GetInterInvoiceCriteria() { InterInvoiceId = id, IsEdit = isEdit, EditedBy = editedBy };
            using var db = ObjectDbFactory.CreateInstance(criteria.GetSettingKey());
            using var multi = await db.QueryMultipleAsync(criteria);
            var invoices = multi.Read<InterInvoiceDetail>().ToList();
            var items = multi.Read<InterInvoiceItem>().ToList();

            foreach (var invoice in invoices)
            {
                invoice.Items = items.Where(i => i.InterInvoiceId == invoice.InterInvoiceId).ToList();
            }

            return invoices.FirstOrDefault() ?? new InterInvoiceDetail();
        }
    }
}
