using Fanex.Data.Repository;

namespace HRM.Criteria.AnnualLeave;

public class ImportCostExpenseCriteria : CriteriaBase
{
    public int BUId { get; set; }

    public string BUCode { get; set; }

    public string FileName { get; set; }

    public int CreatedBy { get; set; }

    public override string GetSettingKey() => "MonthlyCostExpense_Import";

    public override bool IsValid() => BUId > 0 && !string.IsNullOrEmpty(FileName) && !string.IsNullOrEmpty(BUCode);
}