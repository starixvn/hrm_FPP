using FPP.Models.Common;

namespace FPP.Services.Interfaces
{
    public interface ICommonService
    {
        Task<IEnumerable<Currency>> GetAllCurrenciesAsync();

        Task<IEnumerable<Unit>> GetAllUnitsAsync();
    }
}
