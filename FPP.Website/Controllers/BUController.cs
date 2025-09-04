using FPP.Core.Criteria.Common;
using Microsoft.AspNetCore.Mvc;
using FPP.Core.Services;
using FPP.Models.Common;

namespace FPP.Website.Controllers;

public class BUController(IBaseService baseService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> GetBUList()
    {
        var buList = await baseService.GetDataAsync<Unit>(new GetBUListCriteria());
        return Ok(buList);
    }
}
