using FPP.Models.Common;

namespace FPP.Website.ViewModels.InterInvoice
{
    public class PreparedDataViewModel
    {
        public IEnumerable<Unit> AccessibleUnits { get; set; }

        public IEnumerable<Unit> Units { get; set; }

        public IEnumerable<Currency> Currencies { get; set; }

        public bool IsGlobal { get; set; }
    }
}
