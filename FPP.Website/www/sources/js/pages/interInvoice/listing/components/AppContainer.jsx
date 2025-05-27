import React, { useState, useEffect } from 'react';
import { Table, Card, Typography } from 'antd';
import { fetchInvoices } from '../helper/service';
import Filter from './Filter';

const { Title } = Typography;

const AppContainer = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadInvoices = async (params = {}) => {
        setLoading(true);
        const data = await fetchInvoices(params);
        setInvoices(data);
        setLoading(false);
    };

    useEffect(() => {
        loadInvoices();
    }, []);

    const columns = [
        {
            title: 'Invoice ID',
            dataIndex: 'interInvoiceId',
            key: 'interInvoiceId',
            sorter: (a, b) => a.interInvoiceId - b.interInvoiceId,
            defaultSortOrder: 'descend',
            align: 'left',
        },
        {
            title: 'Biller',
            dataIndex: 'billerUnitCode',
            key: 'billerUnitCode',
            sorter: (a, b) => a.billerUnitCode.localeCompare(b.billerUnitCode),
            align: 'left',
        },
        {
            title: 'Payer',
            dataIndex: 'payerUnitCode',
            key: 'payerUnitCode',
            sorter: (a, b) => a.payerUnitCode.localeCompare(b.payerUnitCode),
            align: 'left',
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            sorter: (a, b) => a.totalAmount - b.totalAmount,
            render: (amount) => amount.toLocaleString(),
            align: 'right',
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            sorter: (a, b) => a.currency.localeCompare(b.currency),
            align: 'left',
        },
        {
            title: 'Handler',
            dataIndex: 'handler',
            key: 'handler',
            sorter: (a, b) => a.handler.localeCompare(b.handler),
            align: 'left',
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            sorter: (a, b) => a.notes.localeCompare(b.notes),
            align: 'left',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status.localeCompare(b.status),
            align: 'left',
        },
        {
            title: 'Created Date',
            dataIndex: 'createdDate',
            key: 'createdDate',
            sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
            render: (date) => new Date(date).toLocaleDateString(),
            align: 'left',
        },
        {
            title: 'Created By',
            dataIndex: 'createdBy',
            key: 'createdBy',
            sorter: (a, b) => a.createdBy.localeCompare(b.createdBy),
            align: 'left',
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
                    <Table.Summary.Cell index={2} colSpan={7} />
                </Table.Summary.Row>
            </Table.Summary>
        );
    };

    return (
        <div className="listing-invoice-container">
            <Card title={<Title level={4}>Inter Invoice</Title>} className="report-card">
                <Filter onFilter={loadInvoices} />
                <Table
                    columns={columns}
                    dataSource={invoices}
                    loading={loading}
                    rowKey="interInvoiceId"
                    pagination={false}
                    summary={renderSummaryRow}
                    size="small"
                    scroll={{ x: 'max-content', y: 'calc(100vh - 324px)' }}
                    bordered
                />
            </Card>
        </div>
    );
};

export default AppContainer;
