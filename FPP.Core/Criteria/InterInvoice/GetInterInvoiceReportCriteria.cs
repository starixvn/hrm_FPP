using Fanex.Data.Repository;

namespace FPP.Core.Criteria.InterInvoice
{
    public class GetInterInvoiceReportCriteria : CriteriaBase
    {
        public DateTime Month { get; set; }

        public override string GetSettingKey()
        {
            return "InterInvoice_GetReport";
        }

        public override bool IsValid()
        {
            return true;
        }
    }
}
