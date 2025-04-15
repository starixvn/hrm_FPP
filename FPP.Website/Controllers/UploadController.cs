using FPP.Core.Constants;
using FPP.Core.Services;
using FPP.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers
{
    public class UploadController(IMinIOService minIOService, IUploadService uploadService) : Controller
    {
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var fileName = $"{file.FileName}_{DateTime.Now:yyyyMMddHHmmss}";
            var path = $"{MinIOFolderConstants.BUCostAndExpense}/{fileName}";
            await minIOService.UploadFileAsync(file, Bucket.FPP, path);

            var res = await uploadService.ImportCostExpenseExcelAsync(file, fileName);
            return new JsonResult(res);
        }
    }
}
