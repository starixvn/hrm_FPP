using System.Text;
using FPP.Website.Controllers;
using GO.UserControl.Client.Core.Models;
using GO.UserControl.Client.Core.Models.Auth;
using GO.UserControl.Client.Core.Models.User;
using GO.UserControl.Client.Core.Services;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Moq;

namespace FPP.Website.UnitTests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IUserControlSession> _sessionMock;
    private readonly Mock<IUserService> _userServiceMock;
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly Mock<ICryptoService> _cryptoServiceMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _sessionMock = new Mock<IUserControlSession>();
        _userServiceMock = new Mock<IUserService>();
        _authServiceMock = new Mock<IAuthService>();
        _cryptoServiceMock = new Mock<ICryptoService>();

        var controllerContext = new ControllerContext
        {
            HttpContext = MockHttpContext()
        };

        _controller = new AuthController(
            _sessionMock.Object,
            _userServiceMock.Object,
            _authServiceMock.Object,
            _cryptoServiceMock.Object)
        {
            ControllerContext = controllerContext
        };
    }

    [Fact]
    public void Login_GET_ReturnsViewResult()
    {
        // Act
        var result = _controller.Login();

        // Assert
        Assert.IsType<ViewResult>(result);
    }

    [Fact]
    public async Task Login_POST_WithValidCredentials_RedirectsToHomeIndex()
    {
        // Arrange
        var loginViewModel = new LoginViewModel
        {
            Username = "testuser",
            Password = Convert.ToBase64String(Encoding.UTF8.GetBytes("password"))
        };

        var loginResult = new LoginResult
        {
            IsSuccessfull = true,
            UserId = 1,
            JwtToken = new JwtToken(),
            OnUserId = 1
        };

        _cryptoServiceMock.Setup(x => x.GenerateRijndaelKeyIV())
            .Returns("key:iv");
        _cryptoServiceMock.Setup(x => x.Encrypt(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns("encrypted");
        _authServiceMock.Setup(x => x.LoginAsync(It.IsAny<LoginParam>()))
            .ReturnsAsync(loginResult);
        _userServiceMock.Setup(x => x.GetMenuItemAsync())
            .ReturnsAsync(new List<MenuItem>());
        _userServiceMock.Setup(x => x.GetFunctionPermissionAsync(It.IsAny<short>(), It.IsAny<int>()))
            .ReturnsAsync(new List<FunctionPermission>());
        _userServiceMock.Setup(x => x.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync(new User());

        // Act
        var result = await _controller.Login(loginViewModel);

        // Assert
        var redirectResult = Assert.IsType<RedirectToActionResult>(result);
        Assert.Equal("Index", redirectResult.ActionName);
        Assert.Equal("Home", redirectResult.ControllerName);
    }

    [Fact]
    public async Task Login_POST_WithInvalidCredentials_ReturnsViewWithError()
    {
        // Arrange
        var loginViewModel = new LoginViewModel
        {
            Username = "testuser",
            Password = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("password"))
        };

        var loginResult = new LoginResult
        {
            IsSuccessfull = false,
            ErrorMessage = "Invalid credentials"
        };

        _cryptoServiceMock.Setup(x => x.GenerateRijndaelKeyIV())
            .Returns("key:iv");
        _cryptoServiceMock.Setup(x => x.Encrypt(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns("encrypted");
        _authServiceMock.Setup(x => x.LoginAsync(It.IsAny<LoginParam>()))
            .ReturnsAsync(loginResult);

        // Act
        var result = await _controller.Login(loginViewModel);

        // Assert
        var viewResult = Assert.IsType<ViewResult>(result);
        Assert.False(_controller.ModelState.IsValid);
        Assert.Contains(_controller.ModelState.Values, v => v.Errors.Any(e => e.ErrorMessage == "Invalid credentials"));
    }

    [Fact]
    public async Task Logout_ClearsSessionAndRedirectsToLogin()
    {
        // Arrange
        const int onUserId = 1;
        _sessionMock.Setup(x => x.OnUserId).Returns(onUserId);
        _sessionMock.Setup(x => x.ClearAll()).Verifiable();

        // Act
        var result = await _controller.Logout();

        // Assert
        var redirectResult = Assert.IsType<RedirectToActionResult>(result);
        Assert.Equal("Login", redirectResult.ActionName);
        _sessionMock.Verify(x => x.ClearAll(), Times.Once);
        _authServiceMock.Verify(x => x.LogoutAsync(onUserId), Times.Once);
    }

    private static HttpContext MockHttpContext()
    {
        var httpContextMock = new Mock<HttpContext>();
        var headers = new HeaderDictionary
        {
            { "X-Forwarded-For", "127.0.0.1" },
            { "User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        };
        httpContextMock.Setup(x => x.Request.Headers).Returns(headers);
        var session = new Mock<ISession>();
        httpContextMock.Setup(x => x.Session).Returns(session.Object);
        var authServiceMock = new Mock<IAuthenticationService>();
        httpContextMock.Setup(x => x.RequestServices.GetService(typeof(IAuthenticationService)))
            .Returns(authServiceMock.Object);

        var tempDataFactory = new Mock<ITempDataDictionaryFactory>();
        var tempData = new Mock<ITempDataDictionary>();
        tempDataFactory.Setup(x => x.GetTempData(It.IsAny<HttpContext>())).Returns(tempData.Object);
        httpContextMock.Setup(x => x.RequestServices.GetService(typeof(ITempDataDictionaryFactory)))
            .Returns(tempDataFactory.Object);

        var urlHelperFactory = new Mock<IUrlHelperFactory>();
        var urlHelper = new Mock<IUrlHelper>();
        urlHelperFactory.Setup(f => f.GetUrlHelper(It.IsAny<ActionContext>())).Returns(urlHelper.Object);
        httpContextMock.Setup(x => x.RequestServices.GetService(typeof(IUrlHelperFactory)))
            .Returns(urlHelperFactory.Object);

        return httpContextMock.Object;
    }
}
