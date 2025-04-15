using Fanex.Data.Repository;

namespace FPP.Criteria;

public class ImportCostExpenseCriteria : CriteriaBase
{
    public int BUId { get; set; }

    public string FileName { get; set; }

    public string UrlFileName { get; set; }

    public int CreatedBy { get; set; }

    public string TermListJson { get; set; }

    public override string GetSettingKey() => "MonthlyCostExpense_Import";

    public override bool IsValid() => BUId > 0 && !string.IsNullOrEmpty(FileName) && !string.IsNullOrEmpty(TermListJson);
}

public class TermItem 
{
    public string TermName { get; set; }

    public decimal Amount { get; set; }

    public DateTime Month { get; set; }
}