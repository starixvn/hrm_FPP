namespace FPP.Models.BU
{
    public class BUInvoiceSummaryModel
    {
        public int BUId { get; set; }
        public string BUCode { get; set; }
        public string AccountableArea { get; set; }
        public string BUPICName { get; set; }
        
        // Confirmed Status
        public decimal ConfirmedIncome { get; set; }
        public decimal ConfirmedExpense { get; set; }
        
        // Pending Status
        public decimal PendingIncome { get; set; }
        public decimal PendingExpense { get; set; }
        
        // Rejected Status
        public decimal RejectedIncome { get; set; }
        public decimal RejectedExpense { get; set; }
    }
}
