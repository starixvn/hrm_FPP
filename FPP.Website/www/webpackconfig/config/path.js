const path = require('path');

const projectRoot = path.resolve(__dirname, '../../../');

const cssPaths = {
    build: 'wwwroot/css',
    login: ['./www/sources/css/pages/login.scss'],
    error: ['./www/sources/css/pages/error.scss'],
    dashboard_index: ['./www/sources/css/pages/dashboard/index.scss'],
    upload_index: ['./www/sources/css/pages/upload/index.scss'],
    report_index: ['./www/sources/css/pages/report/index.scss'],
};

const scriptPaths = {
    build: 'wwwroot/js',
    login: ['./www/sources/js/pages/login.js'],
    error: ['./www/sources/js/pages/login.js'],
    language: ['./www/sources/js/common/languages/ViewResources_vi_VN.js'],
    dashboard_index: ['./www/sources/js/pages/dashboard/index.jsx'],
    upload_index: ['./www/sources/js/pages/upload/index.jsx'],
    report_index: ['./www/sources/js/pages/report/index.jsx'],
};

module.exports = {
    projectRoot: projectRoot,
    cssPaths: cssPaths,
    scriptPaths: scriptPaths,
};
