using FPP.Core.Criteria.Common;
using FPP.Core.Services;
using FPP.Models;
using FPP.Models.Common;
using FPP.Services.Interfaces;

namespace FPP.Services.Implement
{
    public class CommonService(
        IBaseService baseService) : ICommonService
    {
        public async Task<IEnumerable<Currency>> GetAllCurrenciesAsync()
        {
            return await baseService.GetDataAsync<Currency>(new GetAllCurrenciesCriteria());
        }

        public async Task<IEnumerable<Unit>> GetAllUnitsAsync()
        {
            return await baseService.GetDataAsync<Unit>(new GetAllUnitsCriteria());
        }
    }
}
