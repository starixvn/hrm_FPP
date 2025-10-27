using FPP.Core.Constants;
using FPP.Core.Services;
using FPP.Core.Criteria.Common;
using FPP.Services.Interfaces;
using FPP.Website.Filters;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;
using GO.UserControl.Client.Core.Enumerables;

namespace FPP.Website.Controllers;

public class BUInvoiceController(
    IUserControlSession session,
    IBaseService baseService,
    ICommonService commonService,
    IInterInvoiceService interInvoiceService) : BaseController(session)
{
    //[FppPermission(Policy.Read, FunctionKey.BUInvoiceSummary)]
    public IActionResult Index()
    {
        return View();
    }

    [HttpGet]
    //[FppPermission(Policy.Read, FunctionKey.BUInvoiceSummary)]
    public async Task<IActionResult> GetBUInvoiceSummary(DateTime month)
    {
        var result = await interInvoiceService.GetReportGroupedByPayerAsync(month);
        return new JsonResult(result);
    }

    [HttpGet]
    //[FppPermission(Policy.Read, FunctionKey.BUInvoiceSummary)]
    public async Task<IActionResult> ExportBUInvoiceSummary(DateTime month)
    {
        var excelBytes = await interInvoiceService.ExportInvoiceReportToExcelAsync(month);
        var fileName = $"BUInvoiceSummary_{month:yyyy-MM}.xlsx";
        return File(excelBytes, "application/octet-stream", fileName);
    }
}

