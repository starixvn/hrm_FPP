using Fanex.Data.Repository;

namespace FPP.Core.Criteria.InterCharging;

public class GetInterChargingHistoryCriteria : CriteriaBase
{
    public int? UploadedBy { get; set; }

    public override string GetSettingKey() => "MonthlyInterCharging_GetUploadHistory";

    public override bool IsValid() => true;
}
