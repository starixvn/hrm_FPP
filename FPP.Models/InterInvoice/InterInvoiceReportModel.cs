using System.Collections.Generic;

namespace FPP.Models.InterInvoice
{
    public class InterInvoiceReportModel
    {
        public int BuId { get; set; }
        public string BuCode { get; set; } = string.Empty;
        public string BuCategory { get; set; } = string.Empty;
        public string BuType { get; set; } = string.Empty;
        public string AccountableArea { get; set; } = string.Empty;
        public string BuPicName { get; set; } = string.Empty;
        public List<UnitData> Units { get; set; } = [];
    }

    public class UnitData
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string CurrencySymbol { get; set; } = string.Empty;
        public string Name { get => $"{Id}{Code} ({CurrencySymbol})"; }
        public decimal Value { get; set; }
    }
}
