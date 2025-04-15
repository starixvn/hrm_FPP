import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc)


const ClientTimezone = 7;

export default class DateTimeService {
    static getClientTimezone() {
        return ClientTimezone;
    }

    static getCurrentClientDateTime() {
        const tempdate = new Date();
        const utcdatestring = tempdate.toUTCString();
        return dayjs(utcdatestring).utcOffset(utcdatestring);
    }

    static convertFromUTC(date) {
        const tempdate = new Date(date);
        const utcdate = new Date(Date.UTC(tempdate.getFullYear(),
            tempdate.getMonth(),
            tempdate.getDate(),
            tempdate.getHours(),
            tempdate.getMinutes(),
            tempdate.getSeconds()));
        const utcdatestring = utcdate.toUTCString();
        return dayjs(utcdatestring).utcOffset(utcdatestring);
    }

    static formatDateTime(date, format) {
        return dayjs(date).format(format);
    }

    static toShortTimeFormat(date) {
        return dayjs(date).format('HH:mm');
    }
}