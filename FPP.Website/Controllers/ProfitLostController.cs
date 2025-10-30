using FPP.Core.Constants;
using FPP.Core.Criteria.ProfitLost;
using FPP.Core.Services;
using FPP.Models.ProfitLost;
using FPP.Services.Interfaces;
using FPP.Website.Filters;
using GO.UserControl.Client.Core.Enumerables;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers;

public class ProfitLostController(
    IUserControlSession session,
    IMinIOService minIOService,
    IBaseService baseService,
    IProfitLostService profitLostService) : BaseController(session)
{
    [FppPermission(Policy.Read, FunctionKey.BUPLUpload)]
    public IActionResult Upload()
    {
        ViewBag.IsHost = session.HasPermissionOnFunction(FunctionKey.BUPLUpload, Policy.Host);
        return View();
    }

    [FppPermission(Policy.Host, FunctionKey.BUPLUpload)]
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
        var path = $"{MinIOFolderConstants.ProfitLost}/{savedFileName}";
        var res = await profitLostService.ImportProfitLostExcelAsync(file, savedFileName, EmployeeSession.EmpId);

        if (!res.IsSuccessful)
        {
            return BadRequest(res.Message);
        }
        await minIOService.UploadFileAsync(file, Bucket.FPP, path);
        return new JsonResult(res);
    }

    [FppPermission(Policy.Read, FunctionKey.BUPLUpload)]
    public async Task<IActionResult> DownloadExcel(string savedFileName, string fileName)
    {
        if (string.IsNullOrEmpty(savedFileName))
        {
            return BadRequest("File name is required.");
        }

        var path = $"{MinIOFolderConstants.ProfitLost}/{savedFileName}";
        var stream = await minIOService.GetFileContentAsync(Bucket.FPP, path);

        return File(stream, "application/octet-stream", fileName);
    }

    [FppPermission(Policy.Read, FunctionKey.BUPLUpload)]
    public async Task<IActionResult> GetUploadHistory()
    {
        var criteria = new GetProfitLostHistoryCriteria();
        var result = await baseService.GetDataAsync<ProfitLostHistory>(criteria);
        return new JsonResult(result);
    }

    [FppPermission(Policy.Read, FunctionKey.BUPLConsolidationReport)]
    public IActionResult Report()
    {
        return View();
    }

    [FppPermission(Policy.Read, FunctionKey.BUPLConsolidationReport)]
    [HttpGet]
    public async Task<IActionResult> GetProfitLost(DateTime month)
    {
        var res = await profitLostService.GetProfitLostExcelAsync(month);
        return new JsonResult(res);
    }
}

