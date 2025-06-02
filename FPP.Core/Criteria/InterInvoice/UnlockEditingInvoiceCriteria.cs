using FPP.Core.Models;

namespace FPP.Core.Criteria.InterInvoice
{
    public class UnlockEditingInvoiceCriteria : BaseNonQueryCommand
    {
        public int InterInvoiceId { get; set; }
        public int ModifiedBy { get; set; }

        public override string GetSettingKey()
        {
            return "InterInvoice_UnlockEditing";
        }

        public override bool IsValid()
        {
            return InterInvoiceId > 0 && ModifiedBy > 0;
        }
    }
}
