using FPP.Core.Constants;
using FPP.Core.Services;
using FPP.Website.Filters;
using GO.UserControl.Client.Core.Session;
using GO.UserControl.Client.Core.Enumerables;
using Microsoft.AspNetCore.Mvc;
using FPP.Models;
using FPP.Models.InterCharging;
using FPP.Core.Criteria.InterCharging;

namespace FPP.Website.Controllers;
public class InterInvoiceController(
    IBaseService baseService,
    IUserControlSession session) : Controller
{

    public IActionResult Index()
    {
        return View();
    }

    public async Task<IActionResult> Create()
    {
        return View();
    }
}
