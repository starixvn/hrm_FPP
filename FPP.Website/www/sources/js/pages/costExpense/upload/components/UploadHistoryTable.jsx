import React from 'react';
import UploadHistoryTable from '../../../common/components/UploadHistoryTable';
import PropTypes from 'prop-types';

const CostExpenseUploadHistoryTable = ({ refetchData }) => {
    const columns = [
        {
            title: 'BU ID',
            dataIndex: 'buId',
            key: 'buId',
            align: 'center',
        },
        {
            title: 'BU Code',
            dataIndex: 'buCode',
            key: 'buCode',
            align: 'center',
        },
        {
            title: 'File Name',
            dataIndex: 'fileName',
            key: 'fileName',
            align: 'center',
        },
        {
            title: 'Uploaded By',
            dataIndex: 'createdBy',
            key: 'createdBy',
            align: 'center',
        },
        {
            title: 'Uploaded Date Time',
            dataIndex: 'createdDate',
            key: 'createdDate',
            align: 'center',
            render: text => new Date(text).toLocaleString(),
        },
    ];

    return (
        <UploadHistoryTable
            refetchData={refetchData}
            fetchEndpoint="/CostExpense/GetUploadHistory"
            downloadEndpoint="/CostExpense/DownloadExcel"
            columns={columns}
            rowKey={record => `${record.buId}-${record.createdDate}`}
        />
    );
};

CostExpenseUploadHistoryTable.propTypes = {
    refetchData: PropTypes.any,
};

export default CostExpenseUploadHistoryTable;
