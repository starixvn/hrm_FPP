using System.ComponentModel.DataAnnotations;

namespace FPP.Website.ViewModels.InterInvoice
{
    public class UpdateInterInvoiceViewModel
    {
        [Required]
        public int InterInvoiceId { get; set; }

        [Required]
        public int CurrencyId { get; set; }

        [Required]
        public int PeriodType { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        public string Notes { get; set; }

        [Required]
        public List<InvoiceItemViewModel> Items { get; set; } = new();
    }
}
