namespace FPP.Models.InterCharging
{
    public class MonthlyInterCharging
    {
        public DateTime Month { get; set; }
        public int ChargedGroupUnitId { get; set; }
        public string ChargedGroupUnitCode { get; set; }
        public string Remark { get; set; }
        public decimal Amount { get; set; }
    }
}
