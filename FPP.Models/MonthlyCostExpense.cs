namespace FPP.Models
{
    public class MonthlyCostExpenseCategory
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public List<MonthlyCostExpenseDetail> Details { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class MonthlyCostExpenseDetail
    {
        public int TermId { get; set; }
        public string TermName { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public Dictionary<string, decimal> MonthlyAmounts { get; set; }
        public decimal TotalAmount { get; set; }
    }
}