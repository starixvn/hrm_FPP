using FPP.Core.Criteria;
using FPP.Core.Models;
using FPP.Core.Services;
using FPP.Models;
using FPP.Services.Interfaces;
using FPP.Website.Filters;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers
{
    [FppAuthorize]
    public class ReportController(IReportService reportService, IBaseService baseService) : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> GetCostExpense(int groupUnitId, int year, int? categoryId)
        {
            var res = await reportService.GetCostExpenseExcelAsync(groupUnitId, year, categoryId);
            return new JsonResult(res);
        }

        [HttpGet]
        public async Task<IActionResult> GetCategory()
        {
            var criteria = new GetCategoryCriteria();

            var result = await baseService.GetDataAsync<Category>(criteria);
            return Ok(result);
        }
    }
}
