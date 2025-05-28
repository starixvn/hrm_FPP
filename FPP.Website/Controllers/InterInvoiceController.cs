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
        ViewBag.IsHost = session.HasPermissionOnFunction(FunctionKey.InterInvoice, Policy.Host);
        return View();
    }

    [FppPermission(Policy.Host, FunctionKey.MyBUInvoice, FunctionKey.GlobalInvoice)]
    public IActionResult Create()
    {
        return View();
    }

    [FppPermission(Policy.Host, FunctionKey.MyBUInvoice, FunctionKey.GlobalInvoice)]
    public async Task<IActionResult> Edit(int id)
    {
        var currentEmpUnit = await commonService.GetUnitByEmpIdAsync(session.UserId);
        ViewBag.CurrentEmpUnitId = currentEmpUnit.UnitId;
        ViewBag.IsGlobal = session.HasPermissionOnFunction(FunctionKey.GlobalInvoice, Policy.Host);
        return View(id);
    }

    [FppPermission(Policy.Read, FunctionKey.MyBUInvoice, FunctionKey.GlobalInvoice)]
    public IActionResult Detail(int id)
    {
        return View(id);
    }

    [HttpPost]
    [FppPermission(Policy.Read, FunctionKey.InterInvoice)]
    public async Task<IActionResult> GetInvoiceList([FromBody] GetInterInvoiceListCriteria criteria)
    {
        criteria.IsGlobal = session.HasPermissionOnFunction(FunctionKey.GlobalInvoice, Policy.Read);
        criteria.EmpId = session.UserId;

       var result = await baseService.GetDataAsync<InterInvoiceList>(criteria);
        return Json(result);
    }

    [FppPermission(Policy.Host, FunctionKey.MyBUInvoice, FunctionKey.GlobalInvoice)]
    public async Task<IActionResult> GetPreparedData()
    {
        var currentEmpUnit = await commonService.GetUnitByEmpIdAsync(session.UserId);
        var vm = new PreparedDataViewModel() {
            Units = await commonService.GetAllUnitsAsync(),
            Currencies = await commonService.GetAllCurrenciesAsync(),
            IsGlobal = session.HasPermissionOnFunction(FunctionKey.GlobalInvoice, Policy.Host),
            CurrentEmpUnitId = currentEmpUnit.UnitId
        };
        return new JsonResult(vm);
    }

    [HttpPost]
    [FppPermission(Policy.Host, FunctionKey.MyBUInvoice, FunctionKey.GlobalInvoice)]
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
        result.OutputId = criteria.OutputId;
        return new JsonResult(result);
    }

    [HttpGet]
    [FppPermission(Policy.Read, FunctionKey.MyBUInvoice, FunctionKey.GlobalInvoice)]
    public async Task<IActionResult> GetInvoice(int id, bool isEdit = false)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var isMyBuPermission = session.HasPermissionOnFunction(FunctionKey.MyBUInvoice, Policy.Host);
        var isGlobalPermission = session.HasPermissionOnFunction(FunctionKey.GlobalInvoice, Policy.Host);

        var invoice = await interInvoiceService.GetInterInvoiceById(id, session.UserId, isEdit, isGlobalPermission);
        var currentUserUnit = await commonService.GetUnitByEmpIdAsync(session.UserId);

        if (isMyBuPermission)
        {
            invoice.IsCanConfirmReject = invoice.HandlerId == session.UserId;
            invoice.IsCanEdit = invoice.BillerUnitId == currentUserUnit.UnitId;
        }

        if (isGlobalPermission)
        {
            invoice.IsCanConfirmReject = true;
            invoice.IsCanEdit = true;
        }

        return new JsonResult(invoice);
    }

    [HttpPut]
    [FppPermission(Policy.Host, FunctionKey.MyBUInvoice, FunctionKey.GlobalInvoice)]
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
    [FppPermission(Policy.Host, FunctionKey.MyBUInvoice, FunctionKey.GlobalInvoice)]
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

    [HttpPut]
    [FppPermission(Policy.Host, FunctionKey.MyBUInvoice, FunctionKey.GlobalInvoice)]
    public async Task<IActionResult> UnlockEditing(int id)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var criteria = new UnlockEditingInvoiceCriteria
        {
            InterInvoiceId = id,
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
