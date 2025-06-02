namespace FPP.Models.InterCharging;

public class InterChargingHistory
{
    public int BUId { get; set; }
    public string BUCode { get; set; } = string.Empty;
    public DateTime Month { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string SavedFileName { get; set; } = string.Empty;
    private DateTime _createdDate;
    public DateTime CreatedDate
    {
        get => _createdDate;
        set => _createdDate = value.AddHours(12);
    }
    public string CreatedBy { get; set; } = string.Empty;
}
