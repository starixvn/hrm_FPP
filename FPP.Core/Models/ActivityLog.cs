using FPP.Core.Enums;

namespace FPP.Core.Models;

public class ActivityLog
{
    public int Id { get; set; }

    public ObjectType ObjectTypeId { get; set; }

    public int ObjectId { get; set; }

    public ActionType ActionTypeId { get; set; }

    public required string ChangedData { get; set; }

    public string? SpName { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime CreatedDate { get; set; }
}
