using FPP.Website.Filters;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers;

[FppAuthorize]
public class HomeController() : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
