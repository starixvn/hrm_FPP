using System.Collections.Generic;

namespace FPP.Models.InterInvoice
{
    public class InterInvoiceReportModel
    {
        public int BuId { get; set; }
        public string BuCode { get; set; }
        public string BuCategory { get; set; }
        public string BuType { get; set; }
        public string AccountableArea { get; set; }
        public string BuPicName { get; set; }
        public string DescriptionOfService { get; set; }
        public List<UnitData> Units { get; set; } = new List<UnitData>();
    }

    public class UnitData
    {
        public string Name { get; set; }
        public decimal Value { get; set; }
    }
}
