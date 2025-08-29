using System.ComponentModel.DataAnnotations;

namespace FPP.Website.ViewModels.InterInvoice
{
    public class CreateInterInvoiceViewModel
    {
        [Required]
        public int BillerUnitId { get; set; }

        [Required]
        public int PayerUnitId { get; set; }

        [Required]
        public int CurrencyId { get; set; }

        [Required]
        public int PeriodType { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        public string Notes { get; set; }

        [Required]
        public List<InvoiceItemViewModel> Items { get; set; } = [];
    }

    public class InvoiceItemViewModel
    {
        public int InterInvoiceId { get; set; }

        public int PayerUnitId { get; set; }

        [Required]
        public string ItemDescription { get; set; }

        [Required]
        public decimal Amount { get; set; }
    }
}
