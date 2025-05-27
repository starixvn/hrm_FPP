using System.Runtime.Serialization;
using Fanex.Data.Repository;
using FPP.Core.Enums;

namespace FPP.Core.Criteria.ActivityLog;

public class GetActivityLogCriteria : CriteriaBase
{
    public required ObjectTypeEnum ObjectTypeId { get; set; }

    public int? ObjectId { get; set; }

    public ActionTypeEnum? ActionTypeId { get; set; }

    public override string GetSettingKey() => "ActivityLog_Get";

    public override bool IsValid() => true;
}
