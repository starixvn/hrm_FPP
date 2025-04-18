using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers;

public class ErrorController : Controller
{
    public ActionResult PageNotFound()
    {
        return View();
    }

    public ActionResult AccessDenied()
    {
        return View();
    }

    public ActionResult InternalError()
    {
        return View();
    }
}
