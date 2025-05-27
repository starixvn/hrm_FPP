using System.ComponentModel.DataAnnotations;
using FPP.Models.Common;

namespace FPP.Website.ViewModels.InterInvoice
{
    public class PreparedDataViewModel
    {
        public IEnumerable<Unit> Units { get; set; }

        public IEnumerable<Currency> Currencies { get; set; }

        public bool IsGlobal { get; set; }

        public int CurrentEmpUnitId { get; set; }
    }
}
