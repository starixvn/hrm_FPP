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
        await baseService.ExecuteNonQueryAsync(criteria);
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
        if (changes == null) return null;

        return objectTypeId switch
        {
            //ObjectType.Invoice => [.. changes.Select(item =>
            //{
            //    SerializeChangedValue(item);
            //    return item;
            //})],
            _ => changes
        };
    }

    //private void SerializeChangedValue(FieldChange change)
    //{
    //    switch (change.Field)
    //    {
    //        case "Status":
    //            if (change.OldValue != null)
    //            {
    //                change.OldValue = ((InterInvoiceStatus)Convert.ToInt32(change.OldValue)).GetDescription();
    //            }
    //            if (change.NewValue != null)
    //            {
    //                change.NewValue = ((InterInvoiceStatus)Convert.ToInt32(change.NewValue)).GetDescription();
    //            }
    //            break;

    //        case "ItemListJson":
    //            if (change.OldValue != null)
    //            {
    //                var oldItems = JsonConvert.DeserializeObject<List<InterInvoiceItem>>(change.OldValue.ToString());
    //                change.OldValue = oldItems != null
    //                    ? string.Join(", ", oldItems.Select(i => $"{i.ItemDescription}: {i.Amount}"))
    //                    : null;
    //            }
    //            if (change.NewValue != null)
    //            {
    //                var newItems = JsonConvert.DeserializeObject<List<InterInvoiceItem>>(change.NewValue.ToString());
    //                change.NewValue = newItems != null
    //                    ? string.Join(", ", newItems.Select(i => $"{i.ItemDescription}: {i.Amount}"))
    //                    : null;
    //            }
    //            break;
    //    }
    //}
}
