using Fanex.Data.Repository;

namespace FPP.Core.Criteria.InterInvoice
{
    public class GetInterInvoiceCriteria : CriteriaBase
    {
        public int InterInvoiceId { get; set; }

        public int CurrentEmpId { get; set; }

        public bool IsEdit { get; set; }

        public bool IsGlobal { get; set; }

        public override string GetSettingKey()
        {
            return "InterInvoice_GetById";
        }

        public override bool IsValid()
        {
            return InterInvoiceId > 0;
        }
    }
}
