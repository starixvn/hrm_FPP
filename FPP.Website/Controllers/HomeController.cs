using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers;

public class HomeController(IUserControlSession session) : BaseController(session)
{
    public IActionResult Index()
    {
        return View();
    }
}
