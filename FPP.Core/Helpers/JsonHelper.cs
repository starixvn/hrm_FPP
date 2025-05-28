using System.Reflection;
using FPP.Core.Models;
using Newtonsoft.Json;

namespace FPP.Core.Helpers;

public static class JsonHelper
{

    private static readonly List<string> SkippedFields = ["CreatedBy", "ModifiedBy", "ErrCode", "ErrMsg", "OutputId"];

    public static List<FieldChange> GetChanges<T>(T? oldObj, T? newObj) where T : class
    {
        var changes = new List<FieldChange>();

        var props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        foreach (var prop in props)
        {
            // Skip CreatedBy and ModifiedBy fields
            if (SkippedFields.Contains(prop.Name)) {
                continue;
            }

            object oldVal;
            if (oldObj == null)
            {
                oldVal = "";
            }
            else
            {
                oldVal = prop.GetValue(oldObj) ?? "";
            }

            var newVal = prop.GetValue(newObj) ?? "";

            if (!Equals(oldVal, newVal))
            {
                changes.Add(new FieldChange
                {
                    Field = prop.Name,
                    OldValue = oldVal,
                    NewValue = newVal
                });
            }
        }

        return changes;
    }

    public static string GetStringChanges<T>(T? oldObj, T? newObj) where T : class
    {
        var changes = GetChanges(oldObj, newObj);
        return JsonConvert.SerializeObject(changes);
    }
}
