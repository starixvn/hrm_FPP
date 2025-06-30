using FPP.Core.Models;

namespace FPP.Core.Criteria.CostExpense;

public class ImportCostExpenseCriteria : BaseNonQueryCommand
{
    public int GroupUnitId { get; set; }

    public string FileName { get; set; }

    public string SavedFileName { get; set; }

    public int CreatedBy { get; set; }

    public string TermListJson { get; set; }

    public override string GetSettingKey() => "MonthlyCostExpense_Import";

    public override bool IsValid() => GroupUnitId > 0 && !string.IsNullOrEmpty(FileName) && !string.IsNullOrEmpty(TermListJson);
}

public class TermItem
{
    public string TermName { get; set; }

    public decimal Amount { get; set; }

    public DateTime Month { get; set; }
}
