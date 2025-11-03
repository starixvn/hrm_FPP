using Fanex.Data.Repository;

namespace FPP.Core.Criteria.InterInvoice;

public class GetInterInvoiceListCriteria : CriteriaBase
{
    public int? BillerUnitId { get; set; }
    public int? PayerUnitId { get; set; }
    public DateTime Month { get; set; }
    public bool? IsGlobal { get; set; }
    public int? EmpId { get; set; }

    public override string GetSettingKey() => "InterInvoice_GetList";

    public override bool IsValid() => true;
}
