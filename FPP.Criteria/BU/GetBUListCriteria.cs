using Fanex.Data.Repository;

namespace FPP.Criteria.BU;

public class GetBUListCriteria : CriteriaBase
{
    public override string GetSettingKey() => "BU_GetList";

    public override bool IsValid() => true;
}
