using Fanex.Data.Repository;

namespace FPP.Core.Criteria;

public class GetUploadedUnitCriteria : CriteriaBase
{

    public override string GetSettingKey() => "MonthlyCostExpense_GetAllUnit";

    public override bool IsValid() => true;
}