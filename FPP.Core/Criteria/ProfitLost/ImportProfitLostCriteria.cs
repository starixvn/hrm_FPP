using FPP.Core.Models;

namespace FPP.Core.Criteria.ProfitLost;

public class ImportProfitLostCriteria : BaseNonQueryCommand
{
    public DateTime Month { get; set; }

    public string FileName { get; set; }

    public string SavedFileName { get; set; }

    public int CreatedBy { get; set; }

    public string TermListJson { get; set; }

    public override string GetSettingKey() => "MonthlyProfitLost_Import";

    public override bool IsValid() => !string.IsNullOrEmpty(FileName) && !string.IsNullOrEmpty(TermListJson);
}

public class TermItem
{
    public string TermName { get; set; }

    public decimal Amount { get; set; }

    public int GroupUnitId { get; set; }
}

