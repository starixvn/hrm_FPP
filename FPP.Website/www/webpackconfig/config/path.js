const path = require('path');

const projectRoot = path.resolve(__dirname, '../../../');

const cssPaths = {
    build: 'wwwroot/css',
    login: ['./www/sources/css/pages/login.scss'],
    dashboard_index: ['./www/sources/css/pages/dashboard/index.scss'],
};

const scriptPaths = {
    build: 'wwwroot/js',
    login: ['./www/sources/js/pages/login.js'],
    language: ['./www/sources/js/common/languages/ViewResources_vi_VN.js'],
    dashboard_index: ['./www/sources/js/pages/dashboard/index.jsx'],
};

module.exports = {
    projectRoot: projectRoot,
    cssPaths: cssPaths,
    scriptPaths: scriptPaths
};