using FPP.Models.Common;
using FPP.Models.InterInvoice;

namespace FPP.Services.Interfaces
{
    public interface ICommonService
    {
        Task<IEnumerable<Currency>> GetAllCurrenciesAsync();

        Task<IEnumerable<Unit>> GetAllUnitsAsync();

        Task<Unit> GetUnitByEmpIdAsync(int empId);
    }
}
