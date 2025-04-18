const DEFAULT_RESOURCE_NAME = '_language_vi_VN';
const langCode = window.PageLanguage || 'vi-VN';
const resourceName = `_language_${langCode.replace('-', '_')}`;

export default class LangHelper {
    static getResource(key) {
        var langHandler = window[resourceName];

        return (langHandler && langHandler[key])
            || (window[DEFAULT_RESOURCE_NAME] && window[DEFAULT_RESOURCE_NAME][key])
            || key;
    }

    static formatString(...args) {
        let text = args[0];
        for (let i = 1; i < args.length; i++) {
            let regEx = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
            text = text.replace(regEx, args[i]);
        }

        return text;
    }
}