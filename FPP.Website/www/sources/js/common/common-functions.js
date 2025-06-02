import moment from 'moment';

export default class CommonFunctions {
    static formatCurrency(amount) {
        return amount ? amount.toLocaleString() : '0';
    }

    static formatDate(date) {
        return date ? moment(date).format('DD MMM, YYYY') : '-';
    }

    static formatMonth(date) {
        return date ? moment(date).format('MMM, YYYY') : '-';
    }

    static formatDateTime(date) {
        return date ? moment(date).format('DD MMM, YYYY HH:mm') : '-';
    }
}
