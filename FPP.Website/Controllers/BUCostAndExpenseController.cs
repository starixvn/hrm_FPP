using FPP.Core.Constants;
using FPP.Core.Criteria;
using FPP.Core.Models;
using FPP.Core.Services;
using FPP.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers;

public class BUCostAndExpenseController(IMinIOService minIOService, IBaseService baseService, IUploadService uploadService) : Controller
{
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

    [HttpGet]
    public async Task<IActionResult> DownloadExcel(string savedFileName)
    {
        if (string.IsNullOrEmpty(savedFileName))
        {
            return BadRequest("File name is required.");
        }

        var path = $"{MinIOFolderConstants.BUCostAndExpense}/{savedFileName}";
        var filePath = await minIOService.GetFilePath(Bucket.FPP, path);

        return Redirect(filePath);
    }

    [HttpGet]
    public async Task<IEnumerable<UploadHistory>> GetUploadHistory(int? empId = null)
    {
        var criteria = new GetUploadHistoryCriteria
        {
            UploadedBy = empId
        };

        return await baseService.GetDataAsync<UploadHistory>(criteria);
    }
}