using Fanex.Data.Repository;

namespace FPP.Core.Criteria.InterCharging;

public class GetInterInvoiceListCriteria : CriteriaBase
{
    public int? BillerUnitId { get; set; }
    public int? PayerUnitId { get; set; }
    public bool? IsGlobal { get; set; }
    public int? EmpId { get; set; }
    //public DateTime? FromDate { get; set; }
    //public DateTime? ToDate { get; set; }
    //public string? Currency { get; set; }
    //public string? CreatedBy { get; set; }
    //public string? SortField { get; set; }
    //public string? SortOrder { get; set; }
    //public int PageSize { get; set; }
    //public int PageNumber { get; set; }

    public override string GetSettingKey() => "InterInvoice_GetList";

    public override bool IsValid() => true;
}
