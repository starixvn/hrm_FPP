using Microsoft.AspNetCore.Http;

namespace FPP.Services.Interfaces
{
    public interface IUploadService
    {
        Task<bool> ImportCostExpenseExcelAsync(IFormFile file);
    }
}
