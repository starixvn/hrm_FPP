using System.Diagnostics;
using FPP.Website.Models;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers
{
    public class AuthController : Controller
    {
        public IActionResult Login()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                return RedirectToAction("Dashboard", "Admin");
            }
            return View();
        }

        [HttpPost]
        public IActionResult Login(string email, string password)
        {
            // TODO: Implement actual authentication logic
            if (email == "admin@example.com" && password == "admin")
            {
                // Add authentication cookie
                return RedirectToAction("Dashboard", "Admin");
            }

            ModelState.AddModelError("", "Invalid email or password");
            return View();
        }

        public IActionResult Logout()
        {
            // TODO: Implement logout logic
            return RedirectToAction("Login");
        }
    }
}

