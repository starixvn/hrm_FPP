namespace FPP.Models
{
    public class Term : EntityBase<int>
    {
        public int CategoryId { get; set; }

        public string CategoryName { get; set; } 
    }
}
