using FPP.Core.Enums;
using FPP.Core.Models;

namespace FPP.Core.Criteria.ActivityLog
{
    public class InsertActivityLogCriteria : BaseNonQueryCommand
    {
        public ObjectTypeEnum ObjectTypeId { get; set; }

        public int ObjectId { get; set; }

        public ActionTypeEnum ActionTypeId { get; set; }

        public required string ChangedData { get; set; }

        public string? SpName { get; set; }

        public int? CreatedBy { get; set; }

        public override string GetSettingKey() => "ActivityLog_Insert";

        public override bool IsValid() => true;
    }
}
