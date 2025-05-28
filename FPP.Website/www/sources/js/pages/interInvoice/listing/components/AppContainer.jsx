import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Button } from 'antd';
import { fetchInvoices } from '../helper/service';
import Filter from './Filter';
import { mapInterInvoiceStatus, mapPeriodType } from '../../components/enum';
import { EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AppContainer = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const isHost = document.getElementById('app-container').dataset.isHost === 'True';

    const loadInvoices = async (params = {}) => {
        setLoading(true);
        const data = await fetchInvoices(params);
        setInvoices(data);
        setLoading(false);
    };

    useEffect(() => {
        loadInvoices();
    }, []);

    const handleView = (id) => {
        window.location.href = `/interInvoice/detail/${id}`;
    };

    const columns = [
        {
            title: 'Invoice ID',
            dataIndex: 'interInvoiceId',
            key: 'interInvoiceId',
            sorter: (a, b) => a.interInvoiceId - b.interInvoiceId,
            defaultSortOrder: 'descend',
            align: 'left',
            width: '8%',
        },
        {
            title: 'Biller',
            dataIndex: 'billerUnitCode',
            key: 'billerUnitCode',
            sorter: (a, b) => a.billerUnitCode.localeCompare(b.billerUnitCode),
            align: 'left',
            width: '10%',
        },
        {
            title: 'Payer',
            dataIndex: 'payerUnitCode',
            key: 'payerUnitCode',
            sorter: (a, b) => a.payerUnitCode.localeCompare(b.payerUnitCode),
            align: 'left',
            width: '10%',
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            sorter: (a, b) => a.totalAmount - b.totalAmount,
            render: (amount) => amount.toLocaleString(),
            align: 'right',
            width: '7%',
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            //sorter: (a, b) => a.currency.localeCompare(b.currency),
            align: 'left',
            width: '6%',
        },
        {
            title: 'Handler',
            dataIndex: 'handler',
            key: 'handler',
            sorter: (a, b) => a.handler.localeCompare(b.handler),
            align: 'left',
            width: '10%',
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            sorter: (a, b) => a.notes.localeCompare(b.notes),
            align: 'left',
            width: '10%',
        },
        {
            title: 'Period Type',
            dataIndex: 'periodType',
            key: 'periodType',
            sorter: (a, b) => a.periodType - b.periodType,
            render: (periodType) => mapPeriodType[periodType] || periodType,
            align: 'left',
            width: '8%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status - b.status,
            render: (status) => mapInterInvoiceStatus[status] || status,
            align: 'left',
            width: '10%',
        },
        {
            title: 'Created Date',
            dataIndex: 'createdDate',
            key: 'createdDate',
            sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
            render: (date) => date,
            align: 'left',
            width: '12%',
        },
        {
            title: 'Created By',
            dataIndex: 'createdBy',
            key: 'createdBy',
            sorter: (a, b) => a.createdBy.localeCompare(b.createdBy),
            align: 'left',
            width: '8%',
        },
        {
            title: 'Modified Date',
            dataIndex: 'modifiedDate',
            key: 'modifiedDate',
            sorter: (a, b) => new Date(a.modifiedDate) - new Date(b.modifiedDate),
            render: (date) => date || '-',
            align: 'left',
            width: '12%',
        },
        {
            title: 'Modified By',
            dataIndex: 'modifiedBy',
            key: 'modifiedBy',
            sorter: (a, b) => a.modifiedBy?.localeCompare(b.modifiedBy),
            render: (text) => text || '-',
            align: 'left',
            width: '8%',
        },
        {
            title: 'View Details',
            key: 'view',
            align: 'center',
            width: '8%',
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EyeOutlined style={{ color: '#5273a5' }} />}
                    onClick={() => handleView(record.interInvoiceId)}
                />
            ),
        },
    ];

    const renderSummaryRow = (pageData) => {
        const totalAmount = pageData.reduce((sum, record) => sum + record.totalAmount, 0);
        return (
            <Table.Summary fixed>
                <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                        Total
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                        {totalAmount.toLocaleString()}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={9} />
                </Table.Summary.Row>
            </Table.Summary>
        );
    };

    return (
        <div className="listing-invoice-container">
            <Card title={<Title level={4}>Inter Invoice</Title>} className="report-card">
                <Filter onFilter={loadInvoices} isHost={isHost} />
                <Table
                    columns={columns}
                    dataSource={invoices}
                    loading={loading}
                    rowKey="interInvoiceId"
                    pagination={false}
                    summary={renderSummaryRow}
                    size="small"
                    scroll={{ x: 'max-content', y: 'calc(100vh - 375px)' }}
                    bordered
                />
            </Card>
        </div>
    );
};

export default AppContainer;
