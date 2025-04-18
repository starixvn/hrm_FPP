const _rootUrl = document.getElementById('RootUrl') ? document.getElementById('RootUrl').value : '/';
let _xsrfToken = null;

export default class Site {
    static getXsrfToken() {
        if (!_xsrfToken && document.querySelector('input[name=__RequestVerificationToken]')) {
            _xsrfToken = document.querySelector('input[name=__RequestVerificationToken]').value;
        }

        return _xsrfToken;
    }

    static handleAxiosError(error) {
        if (error.response) {
            let url;
            switch (error.response.status) {
                case 401:
                    url = 'auth/logout';
                    break;

                case 404:
                    url = 'error/PageNotFound';
                    break;

                case 405:
                    url = 'error/AccessDenied';
                    break;

                case 500:
                    url = 'error/InternalError';
                    break;
            }

            //window.location = _rootUrl + url;
        }
    }

    static resolveClientUrl(relativeUrl) {
        return _rootUrl + relativeUrl;
    }

    static toSlug(str) {
        str = str.toLowerCase();

        // xóa dấu
        str = str.normalize('NFD') // chuyển chuỗi sang unicode tổ hợp
            .replace(/[\u0300-\u036f]/g, ''); // xóa các ký tự dấu sau khi tách tổ hợp

        // Thay ký tự đĐ
        str = str.replace(/[đĐ]/g, 'd');

        // Xóa ký tự đặc biệt
        str = str.replace(/([^0-9a-z-\s])/g, '');

        // Xóa khoảng trắng thay bằng ký tự -
        str = str.replace(/(\s+)/g, '-');

        // Xóa ký tự - liên tiếp
        str = str.replace(/-+/g, '-');

        // xóa phần dư - ở đầu & cuối
        str = str.replace(/^-+|-+$/g, '');

        // return
        return str;
    }

    static lockNavigator() {
        let lockResolver;
        if (navigator && navigator.locks && navigator.locks.request) {
            const promise = new Promise(res => {
                lockResolver = res;
            });

            navigator.locks.request('livescore_lock_navigator', { mode: 'shared' }, () => promise);
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function (...theArgs) {
            const context = this,
                args = theArgs;

            const later = () => {
                func.apply(context, args);
            };

            clearTimeout(timeout);
            timeout = setTimeout(later, wait || 500);
        };
    }
}