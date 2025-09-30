using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Security.Claims;
using System.Text;
using Fanex.Data;
using FPP.Core.Constants;
using GO.UserControl.Client.Core;
using GO.UserControl.Client.Core.Models.Auth;
using GO.UserControl.Client.Core.Services;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

namespace FPP.Website.Controllers;

public class AuthController(
    IUserControlSession session,
    IUserService userService,
    IAuthService authService,
    ICryptoService cryptoService) : Controller
{
    public IActionResult Login()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        model.Password = Encoding.UTF8.GetString(Convert.FromBase64String(model.Password));
        var token = cryptoService.GenerateRijndaelKeyIV();
        var keyIv = token.Split(':');
        var rijndaelKey = keyIv[0];
        var rijndaelIv = keyIv[1];
        var loginParam = new LoginParam
        {
            Username = cryptoService.Encrypt(model.Username, rijndaelKey, rijndaelIv),
            Password = cryptoService.Encrypt(model.Password, rijndaelKey, rijndaelIv),
            Token = token,
            IP = GetClientIpAddress(),
            Platform = HttpContext.Request.Headers["User-Agent"].ToString(),
            BrowserName = HttpContext.Request.Headers["User-Agent"].ToString(),
            NetSessionId = HttpContext.Session.Id
        };
        var loginResult = await authService.LoginAsync(loginParam);
        if (loginResult.IsSuccessfull)
        {
            session.UserId = loginResult.UserId;
            session.JwtToken = loginResult.JwtToken;
            session.OnUserId = loginResult.OnUserId;
            session.MenuItems = await userService.GetMenuItemAsync();
            session.Functions = await userService.GetFunctionPermissionAsync(session.SiteId, session.UserId);
            session.Set(SessionKey.CurrentUser, await userService.GetByIdAsync(loginResult.UserId));
            await DoLoginAsync(loginResult.UserId);

            return RedirectToAction("Index", "Home");
        }

        ModelState.AddModelError("", loginResult.ErrorMessage);
        return View();
    }

    [HttpGet]
    public async Task<IActionResult> Logout()
    {
        await authService.LogoutAsync(session.OnUserId);
        session.ClearAll();
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        return RedirectToAction("Login");
    }

    public async Task<IActionResult> SSO(string userId, string onUserId, string time, string redirectUrl = null)
    {
        const string DateTimeFormat = "yyyy-MM-dd HH:mm:ss.fff";
        var userIdValue = Cryptography.DecryptPassword(userId.Replace(" ", "+"));
        var onUserIdValue = Cryptography.DecryptPassword(onUserId.Replace(" ", "+"));
        var timeValue = Cryptography.DecryptPassword(time.Replace(" ", "+"));
        var currentTime = await authService.SSOGetTimeAsync();
        var expiration = DateTime.ParseExact(currentTime, DateTimeFormat, new CultureInfo("en-US")) - DateTime.ParseExact(timeValue, DateTimeFormat, new CultureInfo("en-US"));
        const byte TimeExpiration = 30;
        if (expiration.TotalSeconds <= TimeExpiration)
        {
            var tmpUserId = Convert.ToInt32(userIdValue);
            var ssoParam = new SSOLoginParam
            {
                UserId = tmpUserId,
                CheckOnUserId = Convert.ToInt64(onUserIdValue),
                OnUserId = 0,
                IP = GetClientIpAddress(),
                Platform = HttpContext.Request.Headers["User-Agent"].ToString(),
                BrowserName = HttpContext.Request.Headers["User-Agent"].ToString(),
                NetSessionId = HttpContext.Session.Id
            };
            var loginResult = await authService.SSOLoginAsync(ssoParam);
            if (loginResult.IsSuccessfull)
            {
                session.UserId = loginResult.UserId;
                session.JwtToken = loginResult.JwtToken;
                session.OnUserId = loginResult.OnUserId;
                session.MenuItems = await userService.GetMenuItemAsync();
                session.Functions = await userService.GetFunctionPermissionAsync(session.SiteId, session.UserId);
                session.Set(SessionKey.CurrentUser, await userService.GetByIdAsync(loginResult.UserId));
                await DoLoginAsync(loginResult.UserId);

                return RedirectToAction("Index", "Home");
            }
        }

        return RedirectToAction("Login");
    }


    private async Task DoLoginAsync(int userId)
    {
        var claims = new List<Claim>
        {
            new (ClaimTypes.NameIdentifier, userId.ToString())
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
    }

    private string GetClientIpAddress()
    {
        var forwardedFor = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries)[0].Trim();
        }

        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "Unknown";
    }
}

public class LoginViewModel
{
    [Required]
    public string Username { get; set; }

    [Required]
    public string Password { get; set; }
}
