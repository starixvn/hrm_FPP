using Fanex.Data.Repository;

namespace FPP.Core.Criteria.InterCharging;

public class GetInterChargingCriteria : CriteriaBase
{
    public int GroupUnitId { get; set; }

    public DateTime? Month { get; set; }

    public int? ChargedGroupUnitId { get; set; }

    public override string GetSettingKey() => "MonthlyInterCharging_Get";

    public override bool IsValid() => GroupUnitId > 0;
}
