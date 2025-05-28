namespace FPP.Models.InterInvoice;

public class InterInvoiceList
{
    public int InterInvoiceId { get; set; }
    public string BillerUnitId { get; set; } = string.Empty;
    public string BillerUnitCode { get; set; } = string.Empty;
    public string PayerUnitId { get; set; } = string.Empty;
    public string PayerUnitCode { get; set; } = string.Empty;
    private DateTime _createdDate;
    public DateTime CreatedDate
    {
        get => _createdDate;
        set => _createdDate = value.AddHours(12);
    }
    public string CreatedBy { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string Handler { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int Status { get; set; }
    public int PeriodType { get; set; }
}
