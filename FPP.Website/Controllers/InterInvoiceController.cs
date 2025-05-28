using FPP.Core.Constants;
using FPP.Core.Criteria.InterCharging;
using FPP.Core.Criteria.InterInvoice;
using FPP.Core.Services;
using FPP.Models.InterInvoice;
using FPP.Services.Interfaces;
using FPP.Website.Filters;
using FPP.Website.ViewModels.InterInvoice;
using GO.UserControl.Client.Core.Enumerables;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace FPP.Website.Controllers;
public class InterInvoiceController(
    IBaseService baseService,
    IUserControlSession session,
    ICommonService commonService,
    IInterInvoiceService interInvoiceService) : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Create()
    {
        return View();
    }

    public IActionResult Edit(int id)
    {
        return View(id);
    }

    public IActionResult Detail(int id)
    {
        return View(id);
    }

    [HttpPost]
    [FppPermission(Policy.Read, FunctionKey.MyBUInvoice, FunctionKey.GlobalInvoice)]
    public async Task<IActionResult> GetInvoiceList([FromBody] GetInterInvoiceListCriteria criteria)
    {
        var isGlobalInvoice = session.HasPermissionOnFunction(FunctionKey.GlobalInvoice, Policy.Read);
        criteria.IsGlobal = isGlobalInvoice;

        var result = await baseService.GetDataAsync<InterInvoiceList>(criteria);
        return Json(result);
    }

    public async Task<IActionResult> GetPreparedData()
    {
        var currentEmpUnit = await commonService.GetUnitByEmpIdAsync(session.UserId);
        var vm = new PreparedDataViewModel() {
            Units = await commonService.GetAllUnitsAsync(),
            Currencies = await commonService.GetAllCurrenciesAsync(),
            IsGlobal = false,
            CurrentEmpUnitId = currentEmpUnit.UnitId
        };
        return new JsonResult(vm);
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
        if (!result.IsSuccessful)
        {
            return BadRequest(result.Message);
        }

        return new JsonResult(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetInvoice(int id)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var criteria = new GetInterInvoiceCriteria
        {
            InterInvoiceId = id
        };

        var invoice = await interInvoiceService.GetInterInvoiceById(id);
        invoice.IsHandler = invoice.HandlerId == session.UserId;
        return new JsonResult(invoice);
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
        if (!result.IsSuccessful)
        {
            return BadRequest(result.Message);
        }
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
        if (!result.IsSuccessful)
        {
            return BadRequest(result.Message);
        }
        return new JsonResult(result);
    }
}
