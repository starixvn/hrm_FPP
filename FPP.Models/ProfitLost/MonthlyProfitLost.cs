using FPP.Models.CostExpense;

namespace FPP.Models.ProfitLost
{
    public class MonthlyProfitLostCategory
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public int CategoryType { get; set; }
        public Dictionary<string, decimal> MonthlyTotalAmounts { get; set; }
        public IEnumerable<MonthlyProfitLostDetail> Details { get; set; }
    }

    public class MonthlyProfitLostDetail
    {
        public int TermId { get; set; }
        public string TermName { get; set; }
        public Dictionary<string, decimal> BUAmounts { get; set; }
    }

    public class MonthlyProfitLost
    {
        public int TermId { get; set; }
        public string TermName { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public int CategoryType { get; set; }
        public string BU { get; set; }
        public decimal Amount { get; set; }
    }

    public class ProfitLostReportResponse
    {
        public IEnumerable<MonthlyProfitLostCategory> Categories { get; set; }
        public IEnumerable<ProfitLostRow> Totals { get; set; }
    }

    public class ProfitLostRow
    {
        public string Name { get; set; }
        public Dictionary<string, decimal> BUAmounts { get; set; }
    }

    public class UnitProfitLostRow
    {
        public string Name { get; set; }
        public Dictionary<string, decimal> MonthAmounts { get; set; }
    }

    public class CostExpenseReportResponse
    {
        public IEnumerable<MonthlyCostExpenseCategory> Categories { get; set; }
        public IEnumerable<UnitProfitLostRow> Totals { get; set; }
    }
}

