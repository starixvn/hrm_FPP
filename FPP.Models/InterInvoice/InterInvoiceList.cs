namespace FPP.Models.InterInvoice;

public class InterInvoiceList
{
    public int InterInvoiceId { get; set; }
    public int BillerUnitId { get; set; }
    public string BillerUnitCode { get; set; } = string.Empty;
    public int PayerUnitId { get; set; }
    public string PayerUnitCode { get; set; } = string.Empty;
    private DateTime? _createdDate;
    public DateTime? CreatedDate
    {
        get => _createdDate;
        set => _createdDate = value?.AddHours(12);
    }
    public string CreatedBy { get; set; } = string.Empty;
    private DateTime? _modifiedDate;
    public DateTime? ModifiedDate
    {
        get => _modifiedDate;
        set => _modifiedDate = value?.AddHours(12);
    }
    public string ModifiedBy { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string Handler { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int Status { get; set; }
    public string RejectionReason { get; set; } = string.Empty;
    public int PeriodType { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
}
