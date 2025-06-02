using System.ComponentModel;

namespace FPP.Core.Enums
{
    public enum ActionType
    {
        [Description("Create")]
        Create = 1,
        [Description("Update")]
        Update = 2,
        [Description("Delete")]
        Delete = 3
    }
}
