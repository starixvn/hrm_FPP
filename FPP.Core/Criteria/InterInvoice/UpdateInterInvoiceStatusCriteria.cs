using FPP.Core.Models;

namespace FPP.Core.Criteria.InterInvoice
{
    public class UpdateInterInvoiceStatusCriteria : BaseNonQueryCommand
    {
        public int InterInvoiceId { get; set; }
        public int ModifiedBy { get; set; }
        public byte Status { get; set; }
        public string? RejectionReason { get; set; }

        public override string GetSettingKey()
        {
            return "InterInvoice_UpdateStatus";
        }

        public override bool IsValid()
        {
            return InterInvoiceId > 0 && ModifiedBy > 0;
        }
    }
}
