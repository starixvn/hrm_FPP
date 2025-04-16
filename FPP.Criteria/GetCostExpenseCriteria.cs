using Fanex.Data.Repository;

namespace FPP.Criteria;

public class GetCostExpenseCriteria : CriteriaBase
{
    public int GroupUnitId { get; set; }

    public override string GetSettingKey() => "MonthlyCostExpense_GetByUnit";

    public override bool IsValid() => GroupUnitId > 0;
}
