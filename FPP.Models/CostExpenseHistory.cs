namespace FPP.Models
{
    public class CostExpenseHistory 
    {
        public int BUId { get; set; }
        public string BUCode { get; set; }
        public string SavedFileName { get; set; }
        public string FileName { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CreatedBy { get; set; }
    }
}
