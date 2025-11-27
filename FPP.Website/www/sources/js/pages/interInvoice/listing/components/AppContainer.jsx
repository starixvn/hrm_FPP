import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Button, Tooltip } from 'antd';
import { fetchAccessibleUnits, fetchInvoices } from '../../helper/service';
import Filter from './Filter';
import { mapInterInvoiceStatus, mapPeriodType, InterInvoiceStatus } from '../../helper/enum';
import { EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import CommonFunctions from '../../../../common/common-functions';
import { formatPeriod, formatAmount } from '../../helper/format';
import DateTimeService from '../../../../common/dateTimeService';

const { Title } = Typography;

const AppContainer = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [accessibleUnits, setAccessibleUnits] = useState([]);
    const isHost = document.getElementById('app-container').dataset.isHost === 'True';

    const loadInvoices = async (params = {}) => {
        setLoading(true);
        params.month = params.month
            ? params.month.format('YYYY-MM')
            : DateTimeService.getPreviousMonth().format('YYYY-MM');
        const data = await fetchInvoices(params);
        setInvoices(data);
        setLoading(false);
    };

    const loadAccessibleUnits = async () => {
        const data = await fetchAccessibleUnits();
        setAccessibleUnits(data);
    };

    useEffect(() => {
        loadInvoices();
        loadAccessibleUnits();
    }, []);

    const handleView = id => {
        window.location.href = `/interInvoice/detail/${id}`;
    };

    const handleExportExcel = (params = {}) => {
        params.month = params.month
            ? params.month.format('YYYY-MM')
            : DateTimeService.getPreviousMonth().format('YYYY-MM');
        window.location.href = `/InterInvoice/ExportInterInvoice?${new URLSearchParams(
            params
        ).toString()}`;
    };

    const columns = [
        {
            title: 'Invoice ID',
            dataIndex: 'interInvoiceId',
            key: 'interInvoiceId',
            sorter: (a, b) => a.interInvoiceId - b.interInvoiceId,
            defaultSortOrder: 'descend',
            align: 'left',
            width: '6%',
        },
        {
            title: 'Biller',
            dataIndex: 'billerUnitCode',
            key: 'billerUnitCode',
            sorter: (a, b) => a.billerUnitCode.localeCompare(b.billerUnitCode),
            align: 'left',
            width: '7%',
        },
        {
            title: 'Receiver',
            dataIndex: 'payerUnitCode',
            key: 'payerUnitCode',
            sorter: (a, b) => a.payerUnitCode.localeCompare(b.payerUnitCode),
            align: 'left',
            width: '7%',
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            sorter: (a, b) => a.totalAmount - b.totalAmount,
            render: amount => formatAmount(amount),
            align: 'right',
            width: '11%',
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            align: 'left',
            width: '5%',
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
            title: 'Period Type',
            dataIndex: 'periodType',
            key: 'periodType',
            sorter: (a, b) => a.periodType - b.periodType,
            render: periodType => mapPeriodType[periodType] || periodType,
            align: 'left',
            width: '8%',
        },
        {
            title: 'Period',
            dataIndex: 'fromDate',
            key: 'period',
            sorter: (a, b) => new Date(a.fromDate) - new Date(b.fromDate),
            render: (_, record) => formatPeriod(record.periodType, record.fromDate, record.toDate),
            align: 'left',
            width: '12%',
        },
        {
            title: 'Created Date',
            dataIndex: 'createdDate',
            key: 'createdDate',
            sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
            render: date => CommonFunctions.formatDateTime(date),
            align: 'left',
            width: '12%',
        },
        {
            title: 'Created By',
            dataIndex: 'createdBy',
            key: 'createdBy',
            sorter: (a, b) => a.createdBy.localeCompare(b.createdBy),
            align: 'left',
            width: '10%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status - b.status,
            render: (status, record) => {
                const statusText = mapInterInvoiceStatus[status] || status;
                const hasReason = record.rejectionReason && record.rejectionReason.trim();

                return (
                    <div className="status-with-reason">
                        <span className={`status-${statusText.toLowerCase()}`}>{statusText}</span>
                        {hasReason && (
                            <Tooltip title={record.rejectionReason} placement="top">
                                <ExclamationCircleOutlined className="reason-icon" />
                            </Tooltip>
                        )}
                    </div>
                );
            },
            align: 'left',
            width: '8%',
        },
        {
            title: '',
            key: 'view',
            align: 'center',
            width: '3%',
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EyeOutlined style={{ color: '#5273a5' }} />}
                    onClick={() => handleView(record.interInvoiceId)}
                />
            ),
        },
    ];

    const renderSummaryRow = pageData => {
        if (!accessibleUnits || accessibleUnits.length === 0) {
            return null;
        }

        const confirmedInvoices = invoices.filter(
            record => record.status === InterInvoiceStatus.Confirmed
        );

        const unitTotals = {};
        const unitCurrencies = {};
        accessibleUnits.forEach(unit => {
            unitTotals[unit.unitId] = 0;
            unitCurrencies[unit.unitId] = null;
        });

        confirmedInvoices.forEach(invoice => {
            if (!invoice || !invoice.totalAmount) return;

            const billerUnit = accessibleUnits.find(unit => unit.unitId === invoice.billerUnitId);
            if (billerUnit) {
                unitTotals[billerUnit.unitId] =
                    (unitTotals[billerUnit.unitId] || 0) + invoice.totalAmount;
                if (!unitCurrencies[billerUnit.unitId] && invoice.currency) {
                    unitCurrencies[billerUnit.unitId] = invoice.currency;
                }
            }
            const payerUnit = accessibleUnits.find(unit => unit.unitId === invoice.payerUnitId);
            if (payerUnit) {
                unitTotals[payerUnit.unitId] =
                    (unitTotals[payerUnit.unitId] || 0) - invoice.totalAmount;
                if (!unitCurrencies[payerUnit.unitId] && invoice.currency) {
                    unitCurrencies[payerUnit.unitId] = invoice.currency;
                }
            }
        });

        const allTotal = Object.values(unitTotals).reduce((sum, total) => sum + total, 0);
        // Get currency for "All" - use the most common currency or first found
        const allCurrency =
            confirmedInvoices.length > 0 && confirmedInvoices[0].currency
                ? confirmedInvoices[0].currency
                : null;

        return (
            <Table.Summary fixed>
                {accessibleUnits.map((unit, index) => {
                    const total = unitTotals[unit.unitId] || 0;
                    const displayCode = `${unit.groupUnitId} - ${unit.code}`;
                    return (
                        <Table.Summary.Row key={unit.unitId}>
                            {index === 0 ? (
                                <Table.Summary.Cell
                                    index={0}
                                    colSpan={2}
                                    align="center"
                                    rowSpan={accessibleUnits.length + 1}
                                >
                                    Total Confirmed
                                </Table.Summary.Cell>
                            ) : null}
                            <Table.Summary.Cell index={2} colSpan={1} align="left">
                                {displayCode}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3} align="right">
                                <span className={total < 0 ? 'negative-amount' : ''}>
                                    {formatAmount(total)}
                                </span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={4} align="left">
                                {unitCurrencies[unit.unitId]}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={5} colSpan={7} />
                        </Table.Summary.Row>
                    );
                })}
                <Table.Summary.Row key="all">
                    <Table.Summary.Cell index={2} colSpan={1} align="left">
                        All
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                        <span className={allTotal < 0 ? 'negative-amount' : ''}>
                            {formatAmount(allTotal)}
                        </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="left">
                        {allCurrency}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} colSpan={7} />
                </Table.Summary.Row>
            </Table.Summary>
        );
    };

    return (
        <div className="listing-invoice-container">
            <Card title={<Title level={4}>Inter Invoice</Title>} className="report-card">
                <Filter onFilter={loadInvoices} onExportExcel={handleExportExcel} isHost={isHost} />
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
