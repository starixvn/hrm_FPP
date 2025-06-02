using FPP.Core.Constants;
using FPP.Core.Services;
using FPP.Services.Interfaces;
using FPP.Website.Filters;
using GO.UserControl.Client.Core.Session;
using GO.UserControl.Client.Core.Enumerables;
using Microsoft.AspNetCore.Mvc;
using FPP.Models.InterCharging;
using FPP.Core.Criteria.InterCharging;
using FPP.Models.Common;

namespace FPP.Website.Controllers;
public class InterChargingController(
    IMinIOService minIOService,
    IBaseService baseService,
    IInterChargingService interChargingService,
    IUserControlSession session) : Controller
{
    [FppPermission(Policy.Read, FunctionKey.InterChargingUpload)]
    public IActionResult Upload()
    {
        ViewBag.IsHost = session.HasPermissionOnFunction(FunctionKey.InterChargingUpload, Policy.Host);
        return View();
    }

    [FppPermission(Policy.Host, FunctionKey.InterChargingUpload)]
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
        var path = $"{MinIOFolderConstants.InterCharging}/{savedFileName}";
        var res = await interChargingService.ImportInterChargingExcelAsync(file, savedFileName, session.UserId);
        if (!res.IsSuccessful)
        {
            return BadRequest(res.Message);
        }
        await minIOService.UploadFileAsync(file, Bucket.FPP, path);
        return new JsonResult(res);
    }

    [FppPermission(Policy.Read, FunctionKey.InterChargingUpload)]
    public async Task<IActionResult> DownloadExcel(string savedFileName, string fileName)
    {
        if (string.IsNullOrEmpty(savedFileName))
        {
            return BadRequest("File name is required.");
        }

        var path = $"{MinIOFolderConstants.InterCharging}/{savedFileName}";
        var stream = await minIOService.GetFileContentAsync(Bucket.FPP, path);

        return File(stream, "application/octet-stream", fileName);
    }

    [FppPermission(Policy.Read, FunctionKey.InterChargingUpload)]
    public async Task<IActionResult> GetUploadHistory(int? empId = null)
    {
        var criteria = new GetInterChargingHistoryCriteria
        {
            UploadedBy = empId
        };

        var result = await baseService.GetDataAsync<InterChargingHistory>(criteria);
        return new JsonResult(result);
    }


    [FppPermission(Policy.Read, FunctionKey.InterChargingReport)]
    public IActionResult Report()
    {
        return View();
    }

    [FppPermission(Policy.Read, FunctionKey.InterChargingReport)]
    [HttpGet]
    public async Task<IActionResult> GetInterCharging(int groupUnitId, DateTime? month, int? chargedGroupUnitId)
    {
        var criteria = new GetInterChargingCriteria
        {
            GroupUnitId = groupUnitId,
            Month = month,
            ChargedGroupUnitId = chargedGroupUnitId
        };
        var result = await baseService.GetDataAsync<MonthlyInterCharging>(criteria);
        return new JsonResult(result);
    }

    [FppPermission(Policy.Read, FunctionKey.InterChargingReport)]
    [HttpGet]
    public async Task<IActionResult> GetUnits()
    {
        var res = await baseService.GetDataAsync<Unit>(new GetInterChargingUploadUnitCriteria());
        return new JsonResult(res);
    }
}
