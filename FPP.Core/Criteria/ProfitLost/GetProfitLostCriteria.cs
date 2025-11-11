using Fanex.Data.Repository;

namespace FPP.Core.Criteria.ProfitLost;

public class GetProfitLostCriteria : CriteriaBase
{
    public DateTime Month { get; set; }

    public override string GetSettingKey() => "MonthlyProfitLost_Get";

    public override bool IsValid() => true;
}

