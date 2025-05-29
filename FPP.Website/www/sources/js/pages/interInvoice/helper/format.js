import CommonFunctions from '../../../common/common-functions';
import { PeriodType } from './enum';

export const formatPeriod = (periodType, fromDate, toDate) => {
    if (!fromDate) return '-';

    if (periodType === PeriodType.Monthly) {
        return CommonFunctions.formatMonth(fromDate);
    } else if (periodType === PeriodType.RangeDate) {
        if (!toDate) {
            return '-';
        }
        const formattedFromDate = CommonFunctions.formatDate(fromDate);
        const formattedToDate = CommonFunctions.formatDate(toDate);
        return formattedFromDate === formattedToDate
            ? formattedFromDate
            : `${formattedFromDate} - ${formattedToDate}`;
    } else if (periodType === PeriodType.OneTime) {
        return CommonFunctions.formatDate(fromDate);
    }
    return '-';
};

export const formatAmount = (amount) => {
    if (!amount) {
        return '0';
    }
    return CommonFunctions.formatCurrency(amount);
};

export const formatModifier = (name, date) => {
    if (!name || !date) {
        return '-';
    }
    return `${name} - ${CommonFunctions.formatDateTime(date)}`;
};
