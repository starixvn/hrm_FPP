import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import axios from 'axios';
import CommonFunctions from '../../../../common/common-functions';

const UploadHistoryTable = ({ refetchData }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/ProfitLost/GetUploadHistory');
            setData(response.data);
        } catch (error) {
            message.error('Failed to fetch upload history');
            console.info('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (savedFileName, fileName) => {
        window.location.href = `/ProfitLost/DownloadExcel?savedFileName=${savedFileName}&fileName=${fileName}`;
    };

    useEffect(() => {
        fetchData();
    }, [refetchData]);

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
                <Button
                    type="link"
                    icon={<FileExcelOutlined />}
                    onClick={() => handleDownload(record.savedFileName, record.fileName)}
                >
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
        <Table
            className="custom-table"
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey={record => `${record.month}-${record.createdDate}-${record.fileName}`}
            pagination={{ pageSize: 10 }}
            size="small"
            bordered
        />
    );
};

export default UploadHistoryTable;
