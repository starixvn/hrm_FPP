namespace FPP.Models
{
    public class UploadHistory : EntityBase<int>
    {
        public int BUId { get; set; }
        public string BUCode { get; set; }
        public int MonthlyCostExpenseId { get; set; }
        public decimal Value { get; set; }
        public string FileName { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CreatedBy { get; set; }
    }
}
