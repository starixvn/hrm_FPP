using System.Reflection;
using FPP.Core.Models;

namespace FPP.Core.Helpers;

public static class JsonHelper
{
    public static List<FieldChange> GetChanges<T>(T oldObj, T newObj) where T : class
    {
        var changes = new List<FieldChange>();

        var props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        foreach (var prop in props)
        {
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
}
