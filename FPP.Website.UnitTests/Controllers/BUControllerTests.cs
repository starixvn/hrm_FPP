using FPP.Core.Constants;
using FPP.Core.Criteria.Common;
using FPP.Core.Models;
using FPP.Core.Services;
using FPP.Models.Common;
using FPP.Models.BU;
using FPP.Services.Interfaces;
using FPP.Website.Controllers;
using FPP.Website.Filters;
using GO.UserControl.Client.Core.Enumerables;
using GO.UserControl.Client.Core.Session;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Moq;

namespace FPP.Website.UnitTests.Controllers;

public class BUControllerTests
{
    private readonly Mock<IUserControlSession> _sessionMock;
    private readonly Mock<IBaseService> _baseServiceMock;
    private readonly Mock<ICommonService> _commonServiceMock;
    private readonly Mock<IBUService> _buServiceMock;
    private readonly BUController _controller;

    public BUControllerTests()
    {
        _sessionMock = new Mock<IUserControlSession>();
        _baseServiceMock = new Mock<IBaseService>();
        _commonServiceMock = new Mock<ICommonService>();
        _buServiceMock = new Mock<IBUService>();

        var controllerContext = new ControllerContext { HttpContext = MockHttpContext() };

        _controller = new BUController(
            _sessionMock.Object,
            _baseServiceMock.Object,
            _commonServiceMock.Object,
            _buServiceMock.Object
        )
        {
            ControllerContext = controllerContext,
        };
    }

    [Fact]
    public async Task GetBUList_ReturnsOkResultWithBUList()
    {
        // Arrange
        var expectedBUs = new List<Unit>
        {
            new() {
                UnitId = 1,
                Code = "BU001",
                GroupUnitId = 1,
            },
            new() {
                UnitId = 2,
                Code = "BU002",
                GroupUnitId = 1,
            },
        };

        _baseServiceMock
            .Setup(x => x.GetDataAsync<Unit>(It.IsAny<GetBUListCriteria>()))
            .ReturnsAsync(expectedBUs);

        // Act
        var result = await _controller.GetBUList();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedBUs = Assert.IsAssignableFrom<List<Unit>>(okResult.Value);
        Assert.Equal(expectedBUs.Count, returnedBUs.Count);
        Assert.Equal(expectedBUs[0].UnitId, returnedBUs[0].UnitId);
        Assert.Equal(expectedBUs[0].Code, returnedBUs[0].Code);
    }

    [Fact]
    public async Task GetBUList_WhenServiceThrowsException_ThrowsException()
    {
        // Arrange
        _baseServiceMock
            .Setup(x => x.GetDataAsync<Unit>(It.IsAny<GetBUListCriteria>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _controller.GetBUList());
    }

    [Fact]
    public async Task GetBUListByEmpId_ReturnsOkResultWithAccessibleUnits()
    {
        // Arrange
        const int empId = 123;
        var expectedUnits = new List<Unit>
        {
            new() {
                UnitId = 1,
                Code = "BU001",
                GroupUnitId = 1,
            },
            new() {
                UnitId = 2,
                Code = "BU002",
                GroupUnitId = 1,
            },
        };

        var employeeSession = new EmployeeSession { EmpId = empId };
        _sessionMock.Setup(x => x.Get<EmployeeSession>(SessionKey.CurrentEmployee))
            .Returns(employeeSession);
        _commonServiceMock
            .Setup(x => x.GetAccessibleUnitsByEmpId(empId))
            .ReturnsAsync(expectedUnits);

        // Act
        var result = await _controller.GetBUListByEmpId();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedUnits = Assert.IsAssignableFrom<List<Unit>>(okResult.Value);
        Assert.Equal(expectedUnits.Count, returnedUnits.Count);
        _commonServiceMock.Verify(x => x.GetAccessibleUnitsByEmpId(empId), Times.Once);
    }

    [Fact]
    public async Task GetBUListByEmpId_WhenServiceThrowsException_ThrowsException()
    {
        // Arrange
        const int empId = 123;
        var employeeSession = new EmployeeSession { EmpId = empId };
        _sessionMock.Setup(x => x.Get<EmployeeSession>(SessionKey.CurrentEmployee))
            .Returns(employeeSession);
        _commonServiceMock
            .Setup(x => x.GetAccessibleUnitsByEmpId(empId))
            .ThrowsAsync(new Exception("Service error"));

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _controller.GetBUListByEmpId());
    }

    [Fact]
    public void InvoiceSummary_ReturnsViewResult()
    {
        // Act
        var result = _controller.InvoiceSummary();

        // Assert
        Assert.IsType<ViewResult>(result);
    }

    [Fact]
    public async Task GetBUInvoiceSummary_WithValidParameters_ReturnsJsonResult()
    {
        // Arrange
        var month = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        const int buId = 1;
        var expectedSummary = new List<BUInvoiceSummaryModel>
        {
            new() {
                BUId = 1,
                BUCode = "BU001",
                AccountableArea = "Area1",
                BUPICName = "John Doe",
                ConfirmedIncome = 1000,
                ConfirmedExpense = 500,
                PendingIncome = 200,
                PendingExpense = 100,
                RejectedIncome = 50,
                RejectedExpense = 25,
            },
        };

        _buServiceMock
            .Setup(x => x.GetBUInvoiceSummaryAsync(month, buId))
            .ReturnsAsync(expectedSummary);

        // Act
        var result = await _controller.GetBUInvoiceSummary(month, buId);

        // Assert
        var jsonResult = Assert.IsType<JsonResult>(result);
        var returnedSummary = Assert.IsAssignableFrom<List<BUInvoiceSummaryModel>>(
            jsonResult.Value
        );
        Assert.Equal(expectedSummary.Count, returnedSummary.Count);
        Assert.Equal(expectedSummary[0].BUId, returnedSummary[0].BUId);
        Assert.Equal(expectedSummary[0].BUCode, returnedSummary[0].BUCode);
        _buServiceMock.Verify(x => x.GetBUInvoiceSummaryAsync(month, buId), Times.Once);
    }

    [Fact]
    public async Task GetBUInvoiceSummary_WhenServiceThrowsException_ThrowsException()
    {
        // Arrange
        var month = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        const int buId = 1;
        _buServiceMock
            .Setup(x => x.GetBUInvoiceSummaryAsync(month, buId))
            .ThrowsAsync(new Exception("Service error"));

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _controller.GetBUInvoiceSummary(month, buId));
    }

    [Fact]
    public async Task ExportBUInvoiceSummary_WithValidParameters_ReturnsFileResult()
    {
        // Arrange
        var month = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        const int buId = 1;
        var expectedBytes = new byte[] { 0x50, 0x4B, 0x03, 0x04 }; // Sample Excel file bytes
        var expectedFileName = "BUInvoiceSummary_2024-01.xlsx";

        _buServiceMock
            .Setup(x => x.ExportBUInvoiceSummaryToExcelAsync(month, buId))
            .ReturnsAsync(expectedBytes);

        // Act
        var result = await _controller.ExportBUInvoiceSummary(month, buId);

        // Assert
        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal(expectedBytes, fileResult.FileContents);
        Assert.Equal("application/octet-stream", fileResult.ContentType);
        Assert.Equal(expectedFileName, fileResult.FileDownloadName);
        _buServiceMock.Verify(x => x.ExportBUInvoiceSummaryToExcelAsync(month, buId), Times.Once);
    }

    [Fact]
    public async Task ExportBUInvoiceSummary_WithDifferentMonth_ReturnsCorrectFileName()
    {
        // Arrange
        var month = new DateTime(2024, 12, 1, 0, 0, 0, DateTimeKind.Utc);
        const int buId = 2;
        var expectedBytes = new byte[] { 0x50, 0x4B, 0x03, 0x04 };
        var expectedFileName = "BUInvoiceSummary_2024-12.xlsx";

        _buServiceMock
            .Setup(x => x.ExportBUInvoiceSummaryToExcelAsync(month, buId))
            .ReturnsAsync(expectedBytes);

        // Act
        var result = await _controller.ExportBUInvoiceSummary(month, buId);

        // Assert
        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal(expectedFileName, fileResult.FileDownloadName);
    }

    [Fact]
    public async Task ExportBUInvoiceSummary_WhenServiceThrowsException_ThrowsException()
    {
        // Arrange
        var month = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        const int buId = 1;
        _buServiceMock
            .Setup(x => x.ExportBUInvoiceSummaryToExcelAsync(month, buId))
            .ThrowsAsync(new Exception("Export error"));

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _controller.ExportBUInvoiceSummary(month, buId));
    }

    [Fact]
    public async Task GetBUInvoiceSummary_WithEmptyResult_ReturnsEmptyList()
    {
        // Arrange
        var month = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        const int buId = 1;
        var emptySummary = new List<BUInvoiceSummaryModel>();

        _buServiceMock
            .Setup(x => x.GetBUInvoiceSummaryAsync(month, buId))
            .ReturnsAsync(emptySummary);

        // Act
        var result = await _controller.GetBUInvoiceSummary(month, buId);

        // Assert
        var jsonResult = Assert.IsType<JsonResult>(result);
        var returnedSummary = Assert.IsAssignableFrom<List<BUInvoiceSummaryModel>>(
            jsonResult.Value
        );
        Assert.Empty(returnedSummary);
    }

    [Fact]
    public async Task GetBUList_WithEmptyResult_ReturnsEmptyList()
    {
        // Arrange
        var emptyBUs = new List<Unit>();

        _baseServiceMock
            .Setup(x => x.GetDataAsync<Unit>(It.IsAny<GetBUListCriteria>()))
            .ReturnsAsync(emptyBUs);

        // Act
        var result = await _controller.GetBUList();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedBUs = Assert.IsAssignableFrom<List<Unit>>(okResult.Value);
        Assert.Empty(returnedBUs);
    }

    [Fact]
    public async Task GetBUListByEmpId_WithEmptyResult_ReturnsEmptyList()
    {
        // Arrange
        const int empId = 123;
        var emptyUnits = new List<Unit>();

        var employeeSession = new EmployeeSession { EmpId = empId };
        _sessionMock.Setup(x => x.Get<EmployeeSession>(SessionKey.CurrentEmployee))
            .Returns(employeeSession);
        _commonServiceMock.Setup(x => x.GetAccessibleUnitsByEmpId(empId)).ReturnsAsync(emptyUnits);

        // Act
        var result = await _controller.GetBUListByEmpId();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedUnits = Assert.IsAssignableFrom<List<Unit>>(okResult.Value);
        Assert.Empty(returnedUnits);
    }

    private static HttpContext MockHttpContext()
    {
        var httpContextMock = new Mock<HttpContext>();
        var headers = new HeaderDictionary
        {
            { "X-Forwarded-For", "127.0.0.1" },
            { "User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        };
        httpContextMock.Setup(x => x.Request.Headers).Returns(headers);
        var session = new Mock<ISession>();
        httpContextMock.Setup(x => x.Session).Returns(session.Object);

        var tempDataFactory = new Mock<ITempDataDictionaryFactory>();
        var tempData = new Mock<ITempDataDictionary>();
        tempDataFactory.Setup(x => x.GetTempData(It.IsAny<HttpContext>())).Returns(tempData.Object);
        httpContextMock
            .Setup(x => x.RequestServices.GetService(typeof(ITempDataDictionaryFactory)))
            .Returns(tempDataFactory.Object);

        var urlHelperFactory = new Mock<IUrlHelperFactory>();
        var urlHelper = new Mock<IUrlHelper>();
        urlHelperFactory
            .Setup(f => f.GetUrlHelper(It.IsAny<ActionContext>()))
            .Returns(urlHelper.Object);
        httpContextMock
            .Setup(x => x.RequestServices.GetService(typeof(IUrlHelperFactory)))
            .Returns(urlHelperFactory.Object);

        return httpContextMock.Object;
    }
}
