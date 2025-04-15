namespace FPP.Models
{
    public class MonthlyCostExpense : EntityBase<int>
    {
        public int BUId { get; set; }

        public int BUCode { get; set; }

        public DateTime Time { get; set; }
    }
}
