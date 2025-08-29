using FPP.Core.Models;

namespace FPP.Core.Criteria.InterInvoice
{
    public class CreateInterInvoiceMultiplePayerCriteria : BaseNonQueryCommand
    {
        public int OutputId { get; set; }
        public int BillerUnitId { get; set; }
        public int CurrencyId { get; set; }
        public int PeriodType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string Notes { get; set; }
        public int CreatedBy { get; set; }
        public string ItemListJson { get; set; }

        public override string GetSettingKey()
        {
            return "InterInvoice_CreateForMultiplePayer";
        }

        public override bool IsValid()
        {
            if (string.IsNullOrEmpty(ItemListJson))
            {
                return false;
            }

            return BillerUnitId > 0 && CurrencyId > 0;
        }
    }
}
