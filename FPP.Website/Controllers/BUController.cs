using FPP.Core.Constants;
using FPP.Core.Criteria.Common;
using FPP.Core.Services;
using FPP.Models.Common;
using FPP.Services.Interfaces;
using FPP.Website.Filters;
using GO.UserControl.Client.Core.Enumerables;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers;

public class BUController(
    IUserControlSession session,
    IBaseService baseService,
    ICommonService commonService,
    IBUService buService) : BaseController(session)
{
    [HttpGet]
    public async Task<IActionResult> GetBUList()
    {
        var buList = await baseService.GetDataAsync<Unit>(new GetBUListCriteria());

        return Ok(buList);
    }

    [HttpGet]
    public async Task<IActionResult> GetBUListByEmpId()
    {
        var buList = await commonService.GetAccessibleUnitsByEmpId(EmployeeSession.EmpId);

        return Ok(buList);
    }

    //[FppPermission(Policy.Read, FunctionKey.BUInvoiceSummary)]
    public IActionResult InvoiceSummary()
    {
        return View();
    }

    [HttpGet]
    //[FppPermission(Policy.Read, FunctionKey.BUInvoiceSummary)]
    public async Task<IActionResult> GetBUInvoiceSummary(DateTime month, int buId)
    {
        var result = await buService.GetBUInvoiceSummaryAsync(month, buId);
        return new JsonResult(result);
    }

    [HttpGet]
    //[FppPermission(Policy.Read, FunctionKey.BUInvoiceSummary)]
    public async Task<IActionResult> ExportBUInvoiceSummary(DateTime month, int buId)
    {
        var excelBytes = await buService.ExportBUInvoiceSummaryToExcelAsync(month, buId);
        var fileName = $"BUInvoiceSummary_{month:yyyy-MM}.xlsx";

        return File(excelBytes, "application/octet-stream", fileName);
    }
}
