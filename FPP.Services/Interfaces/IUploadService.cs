using FPP.Core.Models;
using FPP.Models;
using Microsoft.AspNetCore.Http;

namespace FPP.Services.Interfaces
{
    public interface IUploadService
    {
        Task<CommandResult> ImportCostExpenseExcelAsync(IFormFile file);

        Task<IEnumerable<CostExpenseHistory>> GetUploadCostExpenseHistoryAsync();
    }
}
