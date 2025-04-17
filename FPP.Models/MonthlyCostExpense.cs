namespace FPP.Models
{
    public class MonthlyCostExpenseCategory
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public Dictionary<string, decimal> MonthlyTotalAmounts { get; set; }
        public IEnumerable<MonthlyCostExpenseDetail> Details { get; set; }
    }

    public class MonthlyCostExpenseDetail
    {
        public int TermId { get; set; }
        public string TermName { get; set; }
        public Dictionary<string, decimal> MonthlyAmounts { get; set; }
    }

    public class MonthlyCostExpense
    {
        public int TermId { get; set; }
        public string TermName { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public DateTime Month { get; set; }
        public decimal Amount { get; set; }
    }
}