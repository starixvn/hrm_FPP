using Fanex.Data.Repository;

namespace FPP.Core.Criteria.Common
{
    public class GetUnitByEmpIdCriteria : CriteriaBase
    {
        public int EmpId { get; set; }

        public override string GetSettingKey()
        {
            return "Unit_GetUnitByEmpId";
        }

        public override bool IsValid()
        {
            return EmpId > 0;
        }
    }
}
