using FPP.Core.Constants;
using FPP.Core.Criteria;
using FPP.Core.Models;
using FPP.Core.Services;
using FPP.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BUCostAndExpenseController(IMinIOService minIOService, IBaseService baseService, IUploadService uploadService) : ControllerBase
{
    [HttpPost("UploadExcel")]
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

    [HttpGet("DownloadExcel")]
    public async Task<IActionResult> DownloadExcel(string savedFileName)
    {
        if (string.IsNullOrEmpty(savedFileName))
        {
            return BadRequest("File name is required.");
        }

        var path = $"{MinIOFolderConstants.BUCostAndExpense}/{savedFileName}";
        var stream = await minIOService.GetFileContentAsync(Bucket.FPP, path);

        return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", savedFileName);
    }

    [HttpGet("GetUploadHistory")]
    public async Task<ActionResult<IEnumerable<UploadHistory>>> GetUploadHistory(int? empId = null)
    {
        var criteria = new GetUploadHistoryCriteria
        {
            UploadedBy = empId
        };
        var mockData = new List<UploadHistory>
        {
            new()
            {
                BUId = 5,
                BUCode = "BU5",
                FileName = "April_Costs312313.xlsx",
                SavedFileName = "Uploaded_168293874244142414.xlsx",
                CreatedBy = "5",
                CreateTime = new DateTime(2025, 4, 15, 22, 45, 27)
            },
            new()
            {
                BUId = 5,
                BUCode = "BU5",
                FileName = "April_Costs312313.xlsx",
                SavedFileName = "Uploaded_168293874244142414.xlsx",
                CreatedBy = "5",
                CreateTime = new DateTime(2025, 4, 15, 22, 45, 37)
            },
            new()
            {
                BUId = 920,
                BUCode = "BU920",
                FileName = "FMS General Document (1).xlsx",
                SavedFileName = "FMS General Document (1).xlsx_20250416110252",
                CreatedBy = "Mira",
                CreateTime = new DateTime(2025, 4, 16, 0, 2, 53)
            }
        };

        return Ok(mockData);
        //return await baseService.GetDataAsync<UploadHistory>(criteria);
    }
}