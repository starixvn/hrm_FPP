using Fanex.Data.Repository;

namespace FPP.Core.Criteria.InterInvoice
{
    public class GetInterInvoiceReportCriteria : CriteriaBase
    {
        public int? EmpId { get; set; }
        public string Month { get; set; }

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
