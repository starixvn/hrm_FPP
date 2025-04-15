import axios from 'axios';
import Site from './site';

export default class DataService {
    static async getDataAsync(url, params) {
        return await axios.get(
            url,
            {
                params: params,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).then(response => response).catch(Site.handleAxiosError);
    }

    static async postDataAsync(url, params) {
        return await axios.post(
            url,
            params,
            {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'RequestVerificationToken': Site.getXsrfToken()
                }
            }).then(response => response).catch(Site.handleAxiosError);
    }

    static async getFileAsync(url, params) {
        return await axios.post(
            url,
            params,
            {
                responseType: 'blob',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'RequestVerificationToken': Site.getXsrfToken()
                }
            }).then(response => response).catch(Site.handleAxiosError);
    }
}