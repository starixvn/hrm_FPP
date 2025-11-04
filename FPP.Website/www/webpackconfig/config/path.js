const path = require('path');

const projectRoot = path.resolve(__dirname, '../../../');

const cssPaths = {
    build: 'wwwroot/css',
    login: ['./www/sources/css/pages/login.scss'],
    error: ['./www/sources/css/pages/error.scss'],
    dashboard_index: ['./www/sources/css/pages/dashboard/index.scss'],
    costExpense_upload_index: ['./www/sources/css/pages/costExpense/upload/index.scss'],
    costExpense_report_index: ['./www/sources/css/pages/costExpense/report/index.scss'],
    interCharging_upload_index: ['./www/sources/css/pages/interCharging/upload/index.scss'],
    interCharging_report_index: ['./www/sources/css/pages/interCharging/report/index.scss'],
    interInvoice_create_index: ['./www/sources/css/pages/interInvoice/create/index.scss'],
    interInvoice_listing_index: ['./www/sources/css/pages/interInvoice/listing/index.scss'],
    interInvoice_detail_index: ['./www/sources/css/pages/interInvoice/detail/index.scss'],
    interInvoice_report_index: ['./www/sources/css/pages/interInvoice/report/index.scss'],
    bu_index: ['./www/sources/css/pages/bu/invoice/index.scss'],
};

const scriptPaths = {
    build: 'wwwroot/js',
    login: ['./www/sources/js/pages/login.js'],
    error: ['./www/sources/js/pages/login.js'],
    language: ['./www/sources/js/common/languages/ViewResources_vi_VN.js'],
    dashboard_index: ['./www/sources/js/pages/dashboard/index.jsx'],
    costExpense_upload_index: ['./www/sources/js/pages/costExpense/upload/index.jsx'],
    costExpense_report_index: ['./www/sources/js/pages/costExpense/report/index.jsx'],
    interCharging_upload_index: ['./www/sources/js/pages/interCharging/upload/index.jsx'],
    interCharging_report_index: ['./www/sources/js/pages/interCharging/report/index.jsx'],
    interInvoice_create_index: ['./www/sources/js/pages/interInvoice/create/index.jsx'],
    interInvoice_listing_index: ['./www/sources/js/pages/interInvoice/listing/index.jsx'],
    interInvoice_detail_index: ['./www/sources/js/pages/interInvoice/detail/index.jsx'],
    interInvoice_edit_index: ['./www/sources/js/pages/interInvoice/edit/index.jsx'],
    interInvoice_report_index: ['./www/sources/js/pages/interInvoice/report/index.jsx'],
    bu_index: ['./www/sources/js/pages/bu/invoice/index.jsx'],
};

module.exports = {
    projectRoot: projectRoot,
    cssPaths: cssPaths,
    scriptPaths: scriptPaths,
};
