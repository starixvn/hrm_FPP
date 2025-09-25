using Fanex.Data.Repository;

namespace FPP.Core.Criteria.Common
{
    public class GetAccessibleUnitsByEmpIdCriteria : CriteriaBase
    {
        public int EmpId { get; set; }

        public override string GetSettingKey()
        {
            return "Unit_GetAccessibleUnitsByEmpId";
        }

        public override bool IsValid()
        {
            return EmpId > 0;
        }
    }
}
