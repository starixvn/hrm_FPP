using System.ComponentModel.DataAnnotations;

namespace FPP.Website.ViewModels.InterInvoice
{
    public class UpdateInterInvoiceStatusViewModel
    {
        [Required]
        public int InterInvoiceId { get; set; }

        [Required]
        public byte Status { get; set; }

        public string RejectionReason { get; set; }
    }
}
