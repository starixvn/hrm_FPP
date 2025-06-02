using Fanex.Data.Repository;

namespace FPP.Core.Criteria.Common
{
    public class GetAllUnitsCriteria : CriteriaBase
    {
        public override string GetSettingKey()
        {
            return "Unit_GetAll";
        }

        public override bool IsValid()
        {
            return true;
        }
    }
}
