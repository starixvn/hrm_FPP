using Fanex.Data.Repository;

namespace FPP.Core.Models;

public abstract class BaseNonQueryCommand : NonQueryCommand
{
    public int ErrCode { get; set; }

    public string ErrMsg { get; set; }
}