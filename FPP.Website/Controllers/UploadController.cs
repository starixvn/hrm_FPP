using FPP.Core.Constants;
using FPP.Website.Filters;
using Microsoft.AspNetCore.Mvc;
using GO.UserControl.Client.Core.Enumerables;
using GO.UserControl.Client.Core.Session;

namespace FPP.Website.Controllers;

[FppAuthorize]
public class UploadController(IUserControlSession session) : Controller
{
    [FppPermission(Policy.Read, FunctionKey.CostExpenseUpload)]
    public IActionResult Index()
    {
        ViewBag.IsHost = session.HasPermissionOnFunction(FunctionKey.CostExpenseUpload, Policy.Host);
        return View();
    }
}
