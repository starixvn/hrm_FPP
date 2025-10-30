using Fanex.Data.Repository;

namespace FPP.Core.Criteria.ProfitLost;

public class GetProfitLostHistoryCriteria : CriteriaBase
{
    public override string GetSettingKey() => "MonthlyProfitLost_GetUploadHistory";

    public override bool IsValid() => true;
}

