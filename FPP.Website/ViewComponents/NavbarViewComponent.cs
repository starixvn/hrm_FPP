using FPP.Core.Constants;
using GO.UserControl.Client.Core.Models.User;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.ViewComponents;

public class NavbarViewComponent(IUserControlSession session) : ViewComponent
{
    public IViewComponentResult Invoke()
    {
        var user = session.Get<User>(SessionKey.CurrentUser);
        return View(user);
    }
}