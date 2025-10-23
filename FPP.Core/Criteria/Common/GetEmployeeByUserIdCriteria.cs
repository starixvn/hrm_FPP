using Fanex.Data.Repository;

namespace FPP.Core.Criteria.Common;

public class GetEmployeeByUserIdCriteria : CriteriaBase
{
    public int UserId { get; set; }

    public override string GetSettingKey() => "Employee_GetByUserId";

    public override bool IsValid() => UserId > 0;
}
