using FPP.Core.Models;

namespace FPP.Core.Criteria.InterInvoice
{
    public class CreateInterInvoiceCriteria : BaseNonQueryCommand
    {
        public int BillerUnitId { get; set; }
        public int PayerUnitId { get; set; }
        public int CurrencyId { get; set; }
        public bool PeriodType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string Notes { get; set; }
        public int CreatedBy { get; set; }
        public string ItemListJson { get; set; }

        public override string GetSettingKey()
        {
            return "InterInvoice_Create";
        }

        public override bool IsValid()
        {
            if (BillerUnitId == PayerUnitId)
            {
                return false;
            }
            if (string.IsNullOrEmpty(ItemListJson))
            {
                return false;
            }
            return BillerUnitId > 0 && PayerUnitId > 0 && CurrencyId > 0;
        }
    }
}
