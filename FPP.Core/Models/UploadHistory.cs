namespace FPP.Core.Models;

public class UploadHistory
{
    public int BUId { get; set; }
    public string BUCode { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string SavedFileName { get; set; } = string.Empty;
    public DateTime CreateTime { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}