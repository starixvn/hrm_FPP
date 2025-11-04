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
    ICommonService commonService,
    IMinIOService minIOService,
    IBaseService baseService,
    IProfitLostService profitLostService,
    IWebHostEnvironment environment) : BaseController(session)
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

    [FppPermission(Policy.Read, FunctionKey.BUPLUpload)]
    public IActionResult DownloadTemplate()
    {
        var templatePath = Path.Combine(environment.ContentRootPath, "ExcelTemplates", "BU P&L Upload Template.xlsx");
        if (!System.IO.File.Exists(templatePath))
        {
            return NotFound("Template file not found.");
        }
        return PhysicalFile(templatePath, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "BU P&L Upload Template.xlsx");
    }

    [FppPermission(Policy.Read, FunctionKey.BUPLConsolidationReport)]
    public IActionResult ConsolidationReport()
    {
        return View();
    }

    [FppPermission(Policy.Read, FunctionKey.BUPLMyBUData, FunctionKey.BUPLGroupBUData)]
    public IActionResult UnitReport()
    {
        return View();
    }

    [FppPermission(Policy.Read, FunctionKey.BUPLMyBUData, FunctionKey.BUPLGroupBUData)]
    public async Task<IActionResult> GetAccessibleUnits()
    {
        var accessibleUnits = await commonService.GetAccessibleUnitsByEmpId(EmployeeSession.EmpId);
        return new JsonResult(accessibleUnits);
    }



    [FppPermission(Policy.Read, FunctionKey.BUPLConsolidationReport)]
    [HttpGet]
    public async Task<IActionResult> GetConsolidationProfitLost(DateTime month)
    {
        var res = await profitLostService.GetConsolidateProfitLostAsync(month);
        return new JsonResult(res);
    }

    [FppPermission(Policy.Read, FunctionKey.BUPLConsolidationReport)]
    [HttpGet]
    public async Task<IActionResult> GetUnitProfitLost(int year, int groupUnitId)
    {
        var res = await profitLostService.GetUnitProfitLostAsync(year, groupUnitId);
        return new JsonResult(res);
    }

    [HttpGet]
    [FppPermission(Policy.Read, FunctionKey.BUPLConsolidationReport)]
    public async Task<IActionResult> ExportUnitConsolidationProfitLost(int year, int groupUnitId)
    {
        var res = await profitLostService.GetUnitProfitLostAsync(year, groupUnitId);
        var excelBytes = await profitLostService.ExportUnitProfitLostToExcelAsync(res, year, groupUnitId);
        var fileName = $"BU P&L Consolidation Report_{DateTimeOffset.Now.DateTime:yyyy-MM-dd}.xlsx";

        return File(excelBytes, "application/octet-stream", fileName);
    }

    [HttpGet]
    [FppPermission(Policy.Read, FunctionKey.BUPLConsolidationReport)]
    public async Task<IActionResult> ExportConsolidationProfitLost(DateTime month)
    {
        var res = await profitLostService.GetConsolidateProfitLostAsync(month);
        var excelBytes = await profitLostService.ExportProfitLostToExcelAsync(res, month);
        var fileName = $"BU P&L Consolidation Report_{DateTimeOffset.Now.DateTime:yyyy-MM-dd}.xlsx";

        return File(excelBytes, "application/octet-stream", fileName);
    }
}

