using FPP.Core.Models;

namespace FPP.Core.Criteria.InterCharging;

public class ImportInterChargingCriteria : BaseNonQueryCommand
{
    public int GroupUnitId { get; set; }

    public string FileName { get; set; }

    public string SavedFileName { get; set; }

    public DateTime Month { get; set; }

    public int CreatedBy { get; set; }

    public string ChargedListJson { get; set; }

    public override string GetSettingKey() => "MonthlyInterCharging_Import";

    public override bool IsValid() => GroupUnitId > 0 && !string.IsNullOrEmpty(FileName) && !string.IsNullOrEmpty(ChargedListJson) && Month != default;
}

public class ChargedItem
{
    public int ChargedGroupUnitId { get; set; }
    public string Remark { get; set; }
    public decimal Amount { get; set; }
}
