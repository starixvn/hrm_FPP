const path = require('path');

const projectRoot = path.resolve(__dirname, '../../../');

const cssPaths = {
    build: 'wwwroot/css',

    livescore_soccer_index: ['./www/sources/css/pages/livescore/soccer/index.scss'],
};

const scriptPaths = {
    build: 'wwwroot/js',

    language: ['./www/sources/js/common/languages/ViewResources_vi_VN.js'],
    livescore_soccer_index: ['./www/sources/js/pages/livescore/soccer/index/index.jsx'],
};

module.exports = {
    projectRoot: projectRoot,
    cssPaths: cssPaths,
    scriptPaths: scriptPaths
};