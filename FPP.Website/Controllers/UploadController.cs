using FPP.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers
{
    public class UploadController(ILogger<UploadController> logger, IUploadService uploadService) : Controller
    {
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var res = await uploadService.ImportCostExpenseExcelAsync(file);
            return new JsonResult(res);
        }
    }
}
