using Fanex.Data.Repository;

namespace FPP.Criteria;

public class GetUploadCostExpenseHistoryCriteria : CriteriaBase
{
    public override string GetSettingKey() => "MonthlyCostExpense_Import";

    public override bool IsValid() => true;
}