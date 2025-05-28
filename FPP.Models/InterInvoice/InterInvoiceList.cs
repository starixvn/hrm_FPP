namespace FPP.Models.InterInvoice;

public class InterInvoiceList
{
    public int InterInvoiceId { get; set; }
    public string BillerUnitId { get; set; } = string.Empty;
    public string BillerUnitCode { get; set; } = string.Empty;
    public string PayerUnitId { get; set; } = string.Empty;
    public string PayerUnitCode { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string Handler { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
}
