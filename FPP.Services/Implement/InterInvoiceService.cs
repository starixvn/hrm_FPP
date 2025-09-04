using Fanex.Data;
using FPP.Core.Criteria.InterInvoice;
using FPP.Core.Services;
using FPP.Models.InterInvoice;
using FPP.Services.Interfaces;

namespace FPP.Services.Implement
{
    public class InterInvoiceService(IBaseService baseService) : IInterInvoiceService
    {
        public async Task<InterInvoiceDetail> GetInterInvoiceById(int id, int currentUserId, bool isEdit, bool isGlobal)
        {
            var criteria = new GetInterInvoiceCriteria {
                InterInvoiceId = id,
                CurrentEmpId = currentUserId,
                IsEdit = isEdit,
                IsGlobal = isGlobal
            };
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

        public async Task<List<InterInvoiceReportModel>> GetReportGroupedByPayerAsync(DateTime month)
        {
            var balances = await baseService.GetDataAsync<InterInvoiceReport>(new GetInterInvoiceReportCriteria { Month = month });

            var payerGroups = balances
                .GroupBy(x => new {
                    x.PayerGroupId,
                    x.PayerCode,
                    x.PayerCategory,
                    x.PayerType,
                    x.PayerAccountableArea,
                })
                .Select(g => new InterInvoiceReportModel
                {
                    BuId = g.Key.PayerGroupId,
                    BuCode = g.Key.PayerCode,
                    BuCategory = g.Key.PayerCategory,
                    BuType = g.Key.PayerType,
                    AccountableArea = g.Key.PayerAccountableArea,
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
    }
}
