namespace FPP.Core.Models;

public class CommandResult
{
    public int Code { get; set; } = 1;
    public string Message { get; set; } = "Invalid Input Data";

    public short CompanyId { get; set; }

    public bool IsSuccessful => Code == 0;

    public long OutputId { get; set; }
}