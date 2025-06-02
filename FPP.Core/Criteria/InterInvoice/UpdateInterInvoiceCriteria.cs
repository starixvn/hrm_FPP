using FPP.Core.Models;

namespace FPP.Core.Criteria.InterInvoice
{
    public class UpdateInterInvoiceCriteria : BaseNonQueryCommand
    {
        public int InterInvoiceId { get; set; }
        public int CurrencyId { get; set; }
        public int PeriodType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string Notes { get; set; }
        public int ModifiedBy { get; set; }
        public string ItemListJson { get; set; }

        public override string GetSettingKey()
        {
            return "InterInvoice_Update";
        }

        public override bool IsValid()
        {
            return InterInvoiceId > 0 && CurrencyId > 0 && ModifiedBy > 0 && !string.IsNullOrEmpty(ItemListJson);
        }
    }
}
