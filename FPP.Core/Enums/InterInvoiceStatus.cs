using System.ComponentModel;

namespace FPP.Core.Enums
{
    public enum InterInvoiceStatus
    {
        [Description("Pending")]
        Pending = 0,
        [Description("Confirmed")]
        Confirmed = 1,
        [Description("Rejected")]
        Rejected = 2
    }
}
