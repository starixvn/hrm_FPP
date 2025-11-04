using Fanex.Data.Repository;

namespace FPP.Core.Criteria.ProfitLost;

public class GetProfitLostByUnitCriteria : CriteriaBase
{
    public int Year { get; set; }
    public int GroupUnitId { get; set; }

    public override string GetSettingKey() => "MonthlyProfitLost_GetByUnit";

    public override bool IsValid() => true;
}

