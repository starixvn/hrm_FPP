using FPP.Core.Enums;
using FPP.Core.Models;

namespace FPP.Core.Criteria.ActivityLog
{
    public class InsertActivityLogCriteria : BaseNonQueryCommand
    {
        public required ObjectTypeEnum ObjectTypeId { get; set; }

        public required int ObjectId { get; set; }

        public required ActionTypeEnum ActionTypeId { get; set; }

        public required string ChangedData { get; set; }

        public required string SpName { get; set; }

        public required int CreatedBy { get; set; }

        public override string GetSettingKey() => "ActivityLog_Insert";

        public override bool IsValid() => true;
    }
}
