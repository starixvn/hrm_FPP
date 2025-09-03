import { PeriodType } from './enum';
import { DateTimeFormat } from '../../../common/constants';

export const getDateRange = values => {
    switch (values.periodType) {
        case PeriodType.Monthly:
            return {
                fromDate: values.monthlyDate.startOf('month').format(DateTimeFormat.YYYY_MM_DD),
                toDate: values.monthlyDate.startOf('month').format(DateTimeFormat.YYYY_MM_DD),
            };
        case PeriodType.RangeDate:
            return {
                fromDate: values.rangeDate[0].format(DateTimeFormat.YYYY_MM_DD),
                toDate: values.rangeDate[1].format(DateTimeFormat.YYYY_MM_DD),
            };
        case PeriodType.OneTime:
            return {
                fromDate: values.deliveryDate.format(DateTimeFormat.YYYY_MM_DD),
                toDate: values.deliveryDate.format(DateTimeFormat.YYYY_MM_DD),
            };
        default:
            return { fromDate: null, toDate: null };
    }
};

export const calculateTotalAmount = items => {
    return (items || [])
        .filter(item => item && item.amount !== undefined)
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
};
