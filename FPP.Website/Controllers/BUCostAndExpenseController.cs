using FPP.Core.Constants;
using FPP.Core.Criteria;
using FPP.Core.Models;
using FPP.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers;

public class BUCostAndExpenseController(IMinIOService minIOService, IBaseService baseService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> DownloadExcel(string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
        {
            return BadRequest("File name is required.");
        }

        var path = $"{MinIOFolderConstants.BUCostAndExpense}/{fileName}";
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