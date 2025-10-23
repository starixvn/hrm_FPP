using FPP.Core.Constants;
using FPP.Core.Models;
using FPP.Website.Filters;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers;

[FppAuthorize]
public class BaseController(IUserControlSession session) : Controller
{
    protected IUserControlSession session = session;
    protected EmployeeSession EmployeeSession => session.Get<EmployeeSession>(SessionKey.CurrentEmployee) ?? new EmployeeSession();
}
