using FPP.Core.Constants;
using FPP.Core.Criteria;
using FPP.Core.Models;
using FPP.Core.Services;
using FPP.Services.Interfaces;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BUCostAndExpenseController(
    IMinIOService minIOService, 
    IBaseService baseService, 
    IUploadService uploadService, 
    IUserControlSession session) : ControllerBase
{
    [HttpPost("UploadExcel")]
    public async Task<IActionResult> UploadExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(file.FileName);
        var extension = Path.GetExtension(file.FileName);
        var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");

        var savedFileName = $"{fileNameWithoutExtension}_{timestamp}{extension}";
        var path = $"{MinIOFolderConstants.BUCostAndExpense}/{savedFileName}";
        await minIOService.UploadFileAsync(file, Bucket.FPP, path);

        var res = await uploadService.ImportCostExpenseExcelAsync(file, savedFileName, session.UserId);
        return new JsonResult(res);
    }

    [HttpGet("DownloadExcel")]
    public async Task<IActionResult> DownloadExcel(string savedFileName, string fileName)
    {
        if (string.IsNullOrEmpty(savedFileName))
        {
            return BadRequest("File name is required.");
        }

        var path = $"{MinIOFolderConstants.BUCostAndExpense}/{savedFileName}";
        var stream = await minIOService.GetFileContentAsync(Bucket.FPP, path);

        return File(stream, "application/octet-stream", fileName);
    }

    [HttpGet("GetUploadHistory")]
    public async Task<IActionResult> GetUploadHistory(int? empId = null)
    {
        var criteria = new GetUploadHistoryCriteria
        {
            UploadedBy = empId
        };

        var result = await baseService.GetDataAsync<UploadHistory>(criteria);
        return Ok(result);
    }
}