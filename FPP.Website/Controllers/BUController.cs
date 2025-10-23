using FPP.Core.Criteria.Common;
using FPP.Core.Services;
using FPP.Models.Common;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers;

public class BUController(
    IUserControlSession session,
    IBaseService baseService) : BaseController(session)
{
    [HttpGet]
    public async Task<IActionResult> GetBUList()
    {
        var buList = await baseService.GetDataAsync<Unit>(new GetBUListCriteria());
        return Ok(buList);
    }
}
