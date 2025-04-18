using FPP.Core.Constants;
using FPP.Website.Filters;
using Microsoft.AspNetCore.Mvc;
using GO.UserControl.Client.Core.Enumerables;

namespace FPP.Website.Controllers;

[FppAuthorize]
public class HomeController() : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
