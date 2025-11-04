using Fanex.Data.Repository;

namespace FPP.Core.Criteria.BU
{
    public class GetBUInvoiceSummaryCriteria : CriteriaBase
    {
        public DateTime Month { get; set; }
        public int BUId { get; set; }

        public override string GetSettingKey()
        {
            return "BU_InvoiceSummary_Get";
        }

        public override bool IsValid()
        {
            return BUId > 0;
        }
    }
}
