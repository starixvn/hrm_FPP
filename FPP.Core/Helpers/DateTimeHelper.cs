using System.Globalization;

namespace FPP.Core.Helpers
{
    public static class DateTimeHelper
    {
        private static readonly CultureInfo FormatProvider = new CultureInfo("en-US");

        public static string FormatMonth(DateTime date)
        {
            return date.ToString("MMM yyyy", FormatProvider);
        }

        public static DateTime? ParseExcelDate(object? value)
        {
            if (value == null)
            {
                return null;
            }

            if (value is double excelDate)
            {
                return DateTime.FromOADate(excelDate);
            }

            var stringValue = value.ToString();
            if (DateTime.TryParse(stringValue, FormatProvider, DateTimeStyles.None, out var date) ||
                DateTime.TryParseExact(stringValue, "MMM dd yyyy", FormatProvider, DateTimeStyles.None, out date))
            {
                return date;
            }

            return null;
        }

        public static string FormatDateTime(DateTime? date)
        {
            if (!date.HasValue)
                return string.Empty;

            return date.Value.ToString("MMM dd yyyy HH:mm", FormatProvider);
        }

        public static string FormatDate(DateTime? date)
        {
            if (!date.HasValue)
                return string.Empty;

            return date.Value.ToString("MMM dd yyyy", FormatProvider);
        }
    }
}
