using Fanex.Data.Repository;

namespace FPP.Core.Criteria;

public class GetUploadHistoryCriteria : CriteriaBase
{
    public int? UploadedBy { get; set; }

    public override string GetSettingKey() => "BUCostAndExpense_GetUploadHistory";

    public override bool IsValid() => true;
}