using FPP.Core.Criteria.ActivityLog;
using FPP.Core.Helpers;
using FPP.Core.Models;
using FPP.Core.Enums;
using FPP.Models.InterInvoice;
using Newtonsoft.Json;

namespace FPP.Core.Services;

public interface IActivityLogService
{
    Task LogActivity(InsertActivityLogCriteria criteria);
    Task<IEnumerable<ActivityLogModel>> GetLogActivity(GetActivityLogCriteria criteria);
}

public class ActivityLogService(IBaseService baseService) : IActivityLogService
{
    public async Task LogActivity(InsertActivityLogCriteria criteria)
    {
        if (criteria.ChangedData.Any())
        {
            await baseService.ExecuteNonQueryAsync(criteria);
        }
    }

    public async Task<IEnumerable<ActivityLogModel>> GetLogActivity(GetActivityLogCriteria criteria)
    {
        var result = await baseService.GetDataAsync<ActivityLog>(criteria);
        return result.Select(x => new ActivityLogModel
        {
            ObjectTypeName = x.ObjectTypeId.GetDescription(),
            ActionTypeName = x.ActionTypeId.GetDescription(),
            CreatedByName = x.CreatedByName,
            CreatedDate = x.CreatedDate,
            ChangedItems = HandleObjectTypeChanges(x.ObjectTypeId, x.ChangedData)
        });
    }

    private List<FieldChange>? HandleObjectTypeChanges(ObjectType objectTypeId, string changedData)
    {
        var changes = JsonConvert.DeserializeObject<List<FieldChange>>(changedData);
        if (changes == null)
        {
            return null;
        }

        if (objectTypeId == ObjectType.Invoice)
        {
            return changes.Select(item =>
            {
                SerializeChangedValue(item);
                return item;
            }).ToList();
        }

        return changes;
    }

    private static void SerializeChangedValue(FieldChange change)
    {
        if (change.Field == "Status")
        {
            change.OldValue = ((InterInvoiceStatus)Convert.ToInt32(change.OldValue)).GetDescription();
            change.NewValue = ((InterInvoiceStatus)Convert.ToInt32(change.NewValue)).GetDescription();
        }
        if (change.Field == "ItemListJson")
        {
            change.Field = "ItemList";
            var oldItems = JsonConvert.DeserializeObject<List<InterInvoiceItem>>(change.OldValue?.ToString() ?? "[]");
            var newItems = JsonConvert.DeserializeObject<List<InterInvoiceItem>>(change.NewValue?.ToString() ?? "[]");

            change.OldValue = oldItems is { Count: > 0 }
                ? string.Join(", ", oldItems.Select(i => $"{i.ItemDescription}: {i.Amount}"))
                : "";

            change.NewValue = newItems is { Count: > 0 }
                ? string.Join(", ", newItems.Select(i => $"{i.ItemDescription}: {i.Amount}"))
                : "";
        }
    }
}
