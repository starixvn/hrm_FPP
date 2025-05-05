namespace FPP.Models.CostExpense;

public class CostExpenseHistory
{
    public int BUId { get; set; }
    public string BUCode { get; set; } = string.Empty;
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
