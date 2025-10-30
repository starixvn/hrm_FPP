import React from 'react';
import { Button } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import UploadHistoryTable from '../../../common/components/UploadHistoryTable';
import CommonFunctions from '../../../../common/common-functions';
import PropTypes from 'prop-types';

const ProfitLostUploadHistoryTable = ({ refetchData }) => {
    const columns = [
        {
            title: 'Month',
            dataIndex: 'month',
            key: 'month',
            align: 'center',
            render: text => <span>{CommonFunctions.formatMonth(text)?.toUpperCase()}</span>,
            sorter: (a, b) => new Date(a.month) - new Date(b.month),
        },
        {
            title: 'File Name',
            dataIndex: 'fileName',
            key: 'fileName',
            align: 'left',
            ellipsis: true,
            render: (text, record) => (
                <Button type="link" icon={<FileExcelOutlined />} onClick={() => {}}>
                    {text}
                </Button>
            ),
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
            fetchEndpoint="/ProfitLost/GetUploadHistory"
            downloadEndpoint="/ProfitLost/DownloadExcel"
            columns={columns}
            rowKey={record => `${record.month}-${record.createdDate}-${record.fileName}`}
        />
    );
};

ProfitLostUploadHistoryTable.propTypes = {
    refetchData: PropTypes.any,
};

export default ProfitLostUploadHistoryTable;
