namespace FPP.Models.InterInvoice
{
    public class InterInvoiceReport
    {
        public int BillerGroupId { get; set; }
        public string BillerCode { get; set; } = string.Empty;
        public int PayerGroupId { get; set; }
        public string PayerCode { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public string PayerCategory { get; set; } = string.Empty;
        public string PayerType { get; set; } = string.Empty;
        public string PayerAccountableArea { get; set; } = string.Empty;
        public string CurrencySymbol { get; set; } = string.Empty;
        public string PayerPicName { get; set; } = string.Empty;
    }
}
