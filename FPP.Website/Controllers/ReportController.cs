using FPP.Core.Criteria;
using FPP.Core.Models;
using FPP.Core.Services;
using FPP.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController(IReportService reportService, IBaseService baseService) : ControllerBase
    {

        [HttpGet]
        public async Task<IActionResult> GetCostExpense(int groupUnitId, int year, int? categoryId)
        {
            var res = await reportService.GetCostExpenseExcelAsync(groupUnitId, year, categoryId);
            return new JsonResult(res);
        }

        [HttpGet]
        public async Task<IActionResult> GetCategory(int? empId = null)
        {
            var criteria = new GetCategoryCriteria();

            var result = await baseService.GetDataAsync<UploadHistory>(criteria);
            return Ok(result);
        }
    }
}
