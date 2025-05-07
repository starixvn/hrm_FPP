using Fanex.Data.Repository;

namespace FPP.Core.Criteria.CostExpense;

public class GetCostExpenseCriteria : CriteriaBase
{
    public int GroupUnitId { get; set; }

    public int Year { get; set; }

    public int? CategoryId { get; set; }

    public override string GetSettingKey() => "MonthlyCostExpense_Get";

    public override bool IsValid() => GroupUnitId > 0 && Year > 0;
}
