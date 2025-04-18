using FPP.Core.Constants;
using FPP.Core.Criteria;
using FPP.Core.Services;
using FPP.Models;
using FPP.Services.Interfaces;
using FPP.Website.Filters;
using GO.UserControl.Client.Core.Enumerables;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers
{
    [FppAuthorize]
    public class ReportController(IReportService reportService, IBaseService baseService, IUserControlSession session) : Controller
    {
        [FppPermission(Policy.Read, FunctionKey.CostExpenseReport)]
        public IActionResult Index()
        {
            ViewBag.IsHost = session.HasPermissionOnFunction(FunctionKey.CostExpenseReport, Policy.Host);
            return View();
        }

        [FppPermission(Policy.Read, FunctionKey.CostExpenseReport)]
        [HttpGet]
        public async Task<IActionResult> GetCostExpense(int groupUnitId, int year, int? categoryId)
        {
            var res = await reportService.GetCostExpenseExcelAsync(groupUnitId, year, categoryId);
            return new JsonResult(res);
        }

        [FppPermission(Policy.Read, FunctionKey.CostExpenseReport)]
        [HttpGet]
        public async Task<IActionResult> GetFilterData()
        {
            var res = new FilterDataCostExpense
            {
                Categories = await baseService.GetDataAsync<Category>(new GetCategoryCriteria()),
                Units = await baseService.GetDataAsync<Unit>(new GetUploadedUnitCriteria())
            };
            return Ok(res);
        }
    }
}
