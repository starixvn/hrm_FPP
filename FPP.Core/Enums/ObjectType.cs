using System.ComponentModel;

namespace FPP.Core.Enums
{
    public enum ObjectType
    {
        [Description("Monthly Salary")]
        MonthlySalary = 1,

        [Description("Invoice")]
        Invoice = 2,

        [Description("Activity Log")]
        ActivityLog = 3
    }
}
