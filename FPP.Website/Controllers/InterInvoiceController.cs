using FPP.Core.Criteria.InterInvoice;
using FPP.Core.Services;
using FPP.Models.InterInvoice;
using FPP.Services.Interfaces;
using FPP.Website.ViewModels.InterInvoice;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace FPP.Website.Controllers;
public class InterInvoiceController(
    IBaseService baseService,
    IUserControlSession session,
    ICommonService commonService) : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Create()
    {
        return View();
    }

    public async Task<IActionResult> GetPreparedData()
    {
        var currencies = await commonService.GetAllCurrenciesAsync();
        var units = await commonService.GetAllUnitsAsync();
        return Json(new { currencies, units });
    }

    [HttpPost]
    public async Task<IActionResult> CreateInvoice([FromBody] CreateInterInvoiceViewModel viewModel)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var criteria = new CreateInterInvoiceCriteria
        {
            BillerUnitId = viewModel.BillerUnitId,
            PayerUnitId = viewModel.PayerUnitId,
            CurrencyId = viewModel.CurrencyId,
            PeriodType = viewModel.PeriodType,
            FromDate = viewModel.FromDate,
            ToDate = viewModel.ToDate,
            Notes = viewModel.Notes,
            CreatedBy = session.UserId,
            ItemListJson = JsonConvert.SerializeObject(viewModel.Items)
        };

        var result = await baseService.ExecuteNonQueryAsync(criteria);
        return new JsonResult(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetInvoice(int id)
    {
        var criteria = new GetInterInvoiceCriteria
        {
            InterInvoiceId = id
        };

        var invoice = await baseService.GetDataAsync<InterInvoice>(criteria);
        return Json(invoice);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateInvoice([FromBody] UpdateInterInvoiceViewModel viewModel)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var criteria = new UpdateInterInvoiceCriteria
        {
            InterInvoiceId = viewModel.InterInvoiceId,
            CurrencyId = viewModel.CurrencyId,
            PeriodType = viewModel.PeriodType,
            FromDate = viewModel.FromDate,
            ToDate = viewModel.ToDate,
            Notes = viewModel.Notes,
            ModifiedBy = session.UserId,
            ItemListJson = JsonConvert.SerializeObject(viewModel.Items)
        };

        var result = await baseService.ExecuteNonQueryAsync(criteria);
        return new JsonResult(result);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateStatus([FromBody] UpdateInterInvoiceStatusViewModel viewModel)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var criteria = new UpdateInterInvoiceStatusCriteria
        {
            InterInvoiceId = viewModel.InterInvoiceId,
            Status = viewModel.Status,
            RejectionReason = viewModel.RejectionReason,
            ModifiedBy = session.UserId
        };

        var result = await baseService.ExecuteNonQueryAsync(criteria);
        return new JsonResult(result);
    }
}
