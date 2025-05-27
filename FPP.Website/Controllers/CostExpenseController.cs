using FPP.Core.Constants;
using FPP.Core.Services;
using FPP.Services.Interfaces;
using FPP.Website.Filters;
using GO.UserControl.Client.Core.Session;
using GO.UserControl.Client.Core.Enumerables;
using Microsoft.AspNetCore.Mvc;
using FPP.Core.Criteria.CostExpense;
using FPP.Models.CostExpense;
using FPP.Models.Common;

namespace FPP.Website.Controllers;
public class CostExpenseController(
    IMinIOService minIOService,
    IBaseService baseService,
    ICostExpenseService costExpenseService,
    IUserControlSession session) : Controller
{
    [FppPermission(Policy.Read, FunctionKey.CostExpenseUpload)]
    public IActionResult Upload()
    {
        ViewBag.IsHost = session.HasPermissionOnFunction(FunctionKey.CostExpenseUpload, Policy.Host);
        return View();
    }

    [FppPermission(Policy.Host, FunctionKey.CostExpenseUpload)]
    public async Task<IActionResult> UploadExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(file.FileName);
        var extension = Path.GetExtension(file.FileName);
        var timestamp = DateTimeOffset.Now.ToString("yyyyMMddHHmmss");

        var savedFileName = $"{fileNameWithoutExtension}_{timestamp}{extension}";
        var path = $"{MinIOFolderConstants.BUCostAndExpense}/{savedFileName}";
        var res = await costExpenseService.ImportCostExpenseExcelAsync(file, savedFileName, session.UserId);
        if (!res.IsSuccessful)
        {
            return BadRequest(res.Message);
        }
        await minIOService.UploadFileAsync(file, Bucket.FPP, path);
        return new JsonResult(res);
    }

    [FppPermission(Policy.Read, FunctionKey.CostExpenseUpload)]
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

    [FppPermission(Policy.Read, FunctionKey.CostExpenseUpload)]
    public async Task<IActionResult> GetUploadHistory(int? empId = null)
    {
        var criteria = new GetCostExpenseHistoryCriteria
        {
            UploadedBy = empId
        };

        var result = await baseService.GetDataAsync<CostExpenseHistory>(criteria);
        return new JsonResult(result);
    }


    [FppPermission(Policy.Read, FunctionKey.CostExpenseReport)]
    public IActionResult Report()
    {
        return View();
    }

    [FppPermission(Policy.Read, FunctionKey.CostExpenseReport)]
    [HttpGet]
    public async Task<IActionResult> GetCostExpense(int groupUnitId, int year, int? categoryId)
    {
        var res = await costExpenseService.GetCostExpenseExcelAsync(groupUnitId, year, categoryId);
        return new JsonResult(res);
    }

    [FppPermission(Policy.Read, FunctionKey.CostExpenseReport)]
    [HttpGet]
    public async Task<IActionResult> GetFilterData()
    {
        var res = new FilterDataCostExpense
        {
            Categories = await baseService.GetDataAsync<Category>(new GetCategoryCriteria()),
            Units = await baseService.GetDataAsync<Unit>(new GetCostExpenseUploadUnitCriteria())
        };
        return Ok(res);
    }
}
