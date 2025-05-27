namespace FPP.Models.InterInvoice
{
    public class InterInvoice
    {
        public int InterInvoiceId { get; set; }
        public int BillerUnitId { get; set; }
        public int BillerGroupUnitId { get; set; }
        public string BillerName { get; set; }
        public int PayerUnitId { get; set; }
        public int PayerGroupUnitId { get; set; }
        public string PayerName { get; set; }
        public int CurrencyId { get; set; }
        public string Currency { get; set; }
        public int PeriodType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string Notes { get; set; }
        public byte Status { get; set; }
        public int? HandlerId { get; set; }
        public bool IsHandler { get; set; }
        public string HandlerName { get; set; }
        public int? CreatedById { get; set; }
        public string CreatedByName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditingStartedAt { get; set; }
        public string RejectionReason { get; set; }
        public List<InterInvoiceItem> Items { get; set; } = new List<InterInvoiceItem>();
    }
}
