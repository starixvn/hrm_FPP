using Fanex.Data.Repository;

namespace FPP.Core.Criteria.Common
{
    public class GetAllCurrenciesCriteria : CriteriaBase
    {
        public override string GetSettingKey()
        {
            return "Currency_GetAll";
        }

        public override bool IsValid()
        {
            return true;
        }
    }
}
