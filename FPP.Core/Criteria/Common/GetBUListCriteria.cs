using Fanex.Data.Repository;

namespace FPP.Core.Criteria.Common;

public class GetBUListCriteria : CriteriaBase
{
    public override string GetSettingKey() => "BU_GetList";

    public override bool IsValid() => true;
}
