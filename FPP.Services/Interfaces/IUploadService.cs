using FPP.Core.Models;
using Microsoft.AspNetCore.Http;

namespace FPP.Services.Interfaces
{
    public interface IUploadService
    {
        Task<CommandResult> ImportCostExpenseExcelAsync(IFormFile file, string savedFileName, int userId);
    }
}
