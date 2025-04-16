using GO.UserControl.Client.Core.Models;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.ViewComponents;

public class SidebarViewComponent(IUserControlSession session) : ViewComponent
{
    public IViewComponentResult Invoke()
    {
        return View(session.MenuItems ?? new List<MenuItem>());
    }
}