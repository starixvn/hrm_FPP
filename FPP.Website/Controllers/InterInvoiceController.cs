using FPP.Core.Constants;
using FPP.Core.Criteria.ActivityLog;
using FPP.Core.Criteria.InterCharging;
using FPP.Core.Criteria.InterInvoice;
using FPP.Core.Enums;
using FPP.Core.Helpers;
using FPP.Core.Models;
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
    IActivityLogService activityLogService,
    IInterInvoiceService interInvoiceService) : Controller
{
    public IActionResult Index()
    {
        ViewBag.IsHost = session.HasPermissionOnFunction(FunctionKey.MyBUInvoice, Policy.Host) ||
                         session.HasPermissionOnFunction(FunctionKey.GlobalInvoice, Policy.Host);
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
        ViewBag.CurrentEmpUnitId = currentEmpUnit?.UnitId ?? 0;
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
        var vm = new PreparedDataViewModel
        {
            Units = await commonService.GetAllUnitsAsync(),
            Currencies = await commonService.GetAllCurrenciesAsync(),
            IsGlobal = session.HasPermissionOnFunction(FunctionKey.GlobalInvoice, Policy.Host),
            CurrentEmpUnitId = currentEmpUnit?.UnitId ?? 0
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

        await activityLogService.LogActivity(new InsertActivityLogCriteria
        {
            ObjectTypeId = ObjectType.Invoice,
            ObjectId = criteria.OutputId,
            ActionTypeId = ActionType.Create,
            CreatedBy = session.UserId,
            ChangedData = JsonHelper.GetStringChanges(null, criteria),
            SpName = criteria.GetSettingKey(),
        });

        return new JsonResult(result);
    }

    [HttpPost]
    [FppPermission(Policy.Host, FunctionKey.MyBUInvoice, FunctionKey.GlobalInvoice)]
    public async Task<IActionResult> CreateMultipleInvoice([FromBody] CreateInterInvoiceViewModel viewModel)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var criteria = new CreateInterInvoiceMultiplePayerCriteria
        {
            BillerUnitId = viewModel.BillerUnitId,
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
    [FppPermission(Policy.Read, FunctionKey.MyBUInvoice, FunctionKey.GlobalInvoice)]
    public async Task<IActionResult> GetInvoice(int id, bool isEdit = false)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var isMyBuPermissionHost = session.HasPermissionOnFunction(FunctionKey.MyBUInvoice, Policy.Host);
        var isGlobalPermissionHost = session.HasPermissionOnFunction(FunctionKey.GlobalInvoice, Policy.Host);
        var isGlobalPermissionRead = session.HasPermissionOnFunction(FunctionKey.GlobalInvoice, Policy.Read);

        var invoice = await interInvoiceService.GetInterInvoiceById(id, session.UserId, isEdit, isGlobalPermissionRead);
        var currentUserUnit = await commonService.GetUnitByEmpIdAsync(session.UserId);

        if (isMyBuPermissionHost)
        {
            invoice.IsCanConfirmReject = invoice.HandlerId == session.UserId;
            invoice.IsCanEdit = invoice.BillerUnitId == currentUserUnit.UnitId;
        }

        if (isGlobalPermissionHost)
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

        var oldInvoice = await interInvoiceService.GetInterInvoiceById(viewModel.InterInvoiceId, session.UserId, false, true);

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

        var oldCriteria = new UpdateInterInvoiceCriteria
        {
            InterInvoiceId = oldInvoice.InterInvoiceId,
            CurrencyId = oldInvoice.CurrencyId,
            PeriodType = oldInvoice.PeriodType,
            FromDate = oldInvoice.FromDate,
            ToDate = oldInvoice.ToDate,
            Notes = oldInvoice.Notes,
            ItemListJson = JsonConvert.SerializeObject(oldInvoice.Items)
        };

        await activityLogService.LogActivity(new InsertActivityLogCriteria
        {
            ObjectTypeId = ObjectType.Invoice,
            ObjectId = criteria.InterInvoiceId,
            ActionTypeId = ActionType.Update,
            CreatedBy = session.UserId,
            ChangedData = JsonHelper.GetStringChanges(oldCriteria, criteria),
            SpName = criteria.GetSettingKey(),
        });

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

        var oldCriteria = new UpdateInterInvoiceStatusCriteria
        {
            InterInvoiceId = viewModel.InterInvoiceId,
            Status = 0,
        };

        await activityLogService.LogActivity(new InsertActivityLogCriteria
        {
            ObjectTypeId = ObjectType.Invoice,
            ObjectId = criteria.InterInvoiceId,
            ActionTypeId = ActionType.Update,
            ChangedData = JsonHelper.GetStringChanges(oldCriteria, criteria),
            CreatedBy = session.UserId,
            SpName = criteria.GetSettingKey(),
        });
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


    [HttpGet]
    [FppPermission(Policy.Read, FunctionKey.InterInvoice)]
    public async Task<IActionResult> GetActivityLog(int id)
    {
        var criteria = new GetActivityLogCriteria
        {
            ObjectTypeId = ObjectType.Invoice,
            ObjectId = id
        };
        var activityLogs = await activityLogService.GetLogActivity(criteria);
        return new JsonResult(activityLogs);
    }

    [FppPermission(Policy.Read, FunctionKey.InterInvoiceReport)]
    public IActionResult Report()
    {
        return View();
    }

    [HttpGet]
    [FppPermission(Policy.Read, FunctionKey.InterInvoiceReport)]
    public async Task<IActionResult> GetInvoiceReport([FromQuery] GetInterInvoiceReportCriteria criteria)
    {
        criteria.EmpId = session.UserId;
        var fakeData = GetFakeInvoiceReportData();
        return Json(fakeData);
    }

    private static InterInvoiceReportModel[] GetFakeInvoiceReportData()
    {
        return [
            new InterInvoiceReportModel
            {
                BuId = 901,
                BuCode = "IT001",
                BuCategory = "Information Technology",
                BuType = "Support",
                AccountableArea = "North America",
                BuPicName = "John Smith",
                DescriptionOfService = "IT Support and Maintenance Services",
                Units =
                [
                    new UnitData { Name = "901OT (USD)", Value = 2 },
                    new UnitData { Name = "902SP (USD)", Value = 0 },
                    new UnitData { Name = "903NV (USD)", Value = -4 },
                    new UnitData { Name = "905CD (USD)", Value = 0 },
                    new UnitData { Name = "906CL (USD)", Value = 0 },
                    new UnitData { Name = "908IM (USD)", Value = 0 },
                    new UnitData { Name = "909HC (USD)", Value = 0 },
                    new UnitData { Name = "910IH (USD)", Value = 0 },
                    new UnitData { Name = "911LG (USD)", Value = 0 },
                    new UnitData { Name = "913FI (USD)", Value = 0 },
                    new UnitData { Name = "919CI (USD)", Value = 0 },
                    new UnitData { Name = "920OL (USD)", Value = 0 },
                    new UnitData { Name = "921NF (USD)", Value = 0 },
                    new UnitData { Name = "923HJ (USD)", Value = 0 },
                    new UnitData { Name = "924AT (USD)", Value = 0 },
                    new UnitData { Name = "925NX (USD)", Value = 0 },
                    new UnitData { Name = "926AU (USD)", Value = 0 },
                    new UnitData { Name = "928ES (USD)", Value = 0 },
                    new UnitData { Name = "929OS (USD)", Value = 0 },
                    new UnitData { Name = "931PH (USD)", Value = 0 },
                    new UnitData { Name = "932RD (USD)", Value = 0 },
                    new UnitData { Name = "933SO (USD)", Value = 0 },
                    new UnitData { Name = "934SV (USD)", Value = 0 },
                    new UnitData { Name = "935MW (USD)", Value = 0 },
                    new UnitData { Name = "936SR (USD)", Value = 0 }
                ]
            }
        ];
    }

    [HttpGet]
    [FppPermission(Policy.Read, FunctionKey.InterInvoiceReport)]
    public async Task<IActionResult> ExportInvoiceReport([FromQuery] GetInterInvoiceReportCriteria criteria)
    {
        criteria.EmpId = session.UserId;

        return Json("");
    }
}
