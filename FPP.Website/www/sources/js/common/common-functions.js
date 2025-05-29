import moment from 'moment';

export default class CommonFunctions {
    static formatCurrency(amount) {
        return amount ? amount.toLocaleString() : '0';
    }

    static formatDate(date) {
        return date ? moment(date).format('DD/MM/YYYY') : '-';
    }

    static formatDateTime(date) {
        return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
    }
}
