using Fanex.Data.Repository;

namespace FPP.Core.Criteria.InterCharging;

public class GetInterChargingUploadUnitCriteria : CriteriaBase
{

    public override string GetSettingKey() => "MonthlyInterCharging_GetAllUnit";

    public override bool IsValid() => true;
}
