namespace FPP.Models
{
    public class MonthlyCostExpenseDetail : EntityBase<int>
    {
        public int TermId { get; set; }

        public int MonthlyCostExpenseId { get; set; }

        public decimal Value { get; set; }
    }
}
