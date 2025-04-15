const path = require('path');

const projectRoot = path.resolve(__dirname, '../../../');

const cssPaths = {
    build: 'wwwroot/css',

    dashboard_index: ['./www/sources/css/pages/dashboard/index.scss'],
};

const scriptPaths = {
    build: 'wwwroot/js',

    language: ['./www/sources/js/common/languages/ViewResources_vi_VN.js'],
    dashboard_index: ['./www/sources/js/pages/dashboard/index.jsx'],
};

module.exports = {
    projectRoot: projectRoot,
    cssPaths: cssPaths,
    scriptPaths: scriptPaths
};