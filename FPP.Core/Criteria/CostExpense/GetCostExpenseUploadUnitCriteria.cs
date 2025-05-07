using Fanex.Data.Repository;

namespace FPP.Core.Criteria.CostExpense;

public class GetCostExpenseUploadUnitCriteria : CriteriaBase
{

    public override string GetSettingKey() => "MonthlyCostExpense_GetAllUnit";

    public override bool IsValid() => true;
}
