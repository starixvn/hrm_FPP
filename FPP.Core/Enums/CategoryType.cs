using System.ComponentModel;

namespace FPP.Core.Enums
{
    public enum CategoryType
    {
        [Description("Metadata")]
        Metadata = 1,
        [Description("Income")]
        Income = 2,
        [Description("DirectExpense")]
        DirectExpense = 3,
        [Description("OtherExpense")]
        OtherExpense = 4,
        [Description("OtherIncome")]
        OtherIncome = 5,
    }
}
