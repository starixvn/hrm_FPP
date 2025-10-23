using FPP.Core.Constants;
using FPP.Core.Models;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.ViewComponents;

public class NavbarViewComponent(IUserControlSession session) : ViewComponent
{
    public IViewComponentResult Invoke()
    {
        var employee = session.Get<EmployeeSession>(SessionKey.CurrentEmployee) ?? new EmployeeSession();
        return View(employee);
    }
}
