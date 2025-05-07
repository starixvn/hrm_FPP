using Fanex.Data.Repository;

namespace FPP.Core.Criteria.CostExpense;

public class GetCategoryCriteria : CriteriaBase
{

    public override string GetSettingKey() => "Category_GetAll";

    public override bool IsValid() => true;
}
