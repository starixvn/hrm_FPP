using FPP.Models.Common;

namespace FPP.Models.CostExpense
{
    public class FilterDataCostExpense
    {
        public IEnumerable<Category> Categories { get; set; }
        public IEnumerable<Unit> Units { get; set; }
    }
}
