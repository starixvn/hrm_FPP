using Fanex.Data.Repository;

namespace FPP.Core.Criteria;

public class GetCategoryCriteria : CriteriaBase
{

    public override string GetSettingKey() => "Category_GetAll";

    public override bool IsValid() => true;
}