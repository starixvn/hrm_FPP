namespace FPP.Core.Helpers
{
    public static class DateTimeHelper
    {
        public static string FormatMonth(DateTime date)
        {
            return date.ToString("MMM yyyy");
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
            if (DateTime.TryParse(stringValue, out var date) ||
                DateTime.TryParseExact(stringValue, "MMM dd yyyy", null, System.Globalization.DateTimeStyles.None, out date))
            {
                return date;
            }

            return null;
        }
    }
}
