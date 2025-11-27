import React, { useState, useEffect } from 'react';
import { Card, Table, Spin, ConfigProvider, Typography } from 'antd';
import axios from 'axios';
import Filter from './Filter';
import DateTimeService from '../../../../common/dateTimeService';

const { Title } = Typography;
const { Summary } = Table;

const POSITIVE_VALUE_CLASS = 'positive-value summary-value-bold';
const NEGATIVE_VALUE_CLASS = 'negative-value summary-value-bold';

const AppContainer = () => {
    const [loading, setLoading] = useState(false);
    const [buData, setBuData] = useState([]);
    const [buList, setBuList] = useState([]);
    const previousMonth = DateTimeService.getPreviousMonth();
    const [filters, setFilters] = useState({
        month: previousMonth.format('YYYY-MM'),
        buId: null,
    });
    const [selectedMonth, setSelectedMonth] = useState(previousMonth);
    const [selectedBUId, setSelectedBUId] = useState(null);

    const calculateGrandTotals = pageData => {
        const totals = {
            confirmed: { income: 0, expense: 0, net: 0 },
            pending: { income: 0, expense: 0, net: 0 },
            rejected: { income: 0, expense: 0, net: 0 },
        };

        pageData.forEach(record => {
            totals.confirmed.income += record.confirmedIncome || 0;
            totals.confirmed.expense += Math.abs(record.confirmedExpense || 0);
            totals.pending.income += record.pendingIncome || 0;
            totals.pending.expense += Math.abs(record.pendingExpense || 0);
            totals.rejected.income += record.rejectedIncome || 0;
            totals.rejected.expense += Math.abs(record.rejectedExpense || 0);
        });

        totals.confirmed.net = totals.confirmed.income - totals.confirmed.expense;
        totals.pending.net = totals.pending.income - totals.pending.expense;
        totals.rejected.net = totals.rejected.income - totals.rejected.expense;

        return totals;
    };

    const getClassNameForValue = (value, isExpense = false) => {
        if (value === 0) {
            return POSITIVE_VALUE_CLASS;
        }
        if (isExpense) {
            return NEGATIVE_VALUE_CLASS;
        }
        return value < 0 ? NEGATIVE_VALUE_CLASS : POSITIVE_VALUE_CLASS;
    };

    const renderSummaryRow = pageData => {
        if (!pageData || pageData.length === 0) {
            return null;
        }

        const grandTotals = calculateGrandTotals(pageData);

        const renderSummaryCell = (status, type) => {
            let value = grandTotals[status][type];
            const isExpense = type === 'expense';

            if (isExpense) {
                value = value > 0 ? -value : value;
            }

            const className = getClassNameForValue(value, isExpense);
            const formattedTotal = value.toLocaleString('en-US');

            return (
                <Summary.Cell key={`${status}_${type}`} align="right">
                    <span className={className}>{formattedTotal}</span>
                </Summary.Cell>
            );
        };

        return (
            <Summary fixed="top">
                <Summary.Row>
                    <Summary.Cell index={0} colSpan={4} align="right">
                        <span className="summary-label">Total</span>
                    </Summary.Cell>
                    {renderSummaryCell('confirmed', 'income')}
                    {renderSummaryCell('confirmed', 'expense')}
                    {renderSummaryCell('confirmed', 'net')}

                    {renderSummaryCell('pending', 'income')}
                    {renderSummaryCell('pending', 'expense')}
                    {renderSummaryCell('pending', 'net')}

                    {renderSummaryCell('rejected', 'income')}
                    {renderSummaryCell('rejected', 'expense')}
                    {renderSummaryCell('rejected', 'net')}

                    <Summary.Cell />
                </Summary.Row>
            </Summary>
        );
    };

    const generateColumns = () => {
        const baseColumns = [
            {
                title: 'BU ID',
                dataIndex: 'buId',
                key: 'buId',
                width: 90,
                sorter: (a, b) => a.buId - b.buId,
                fixed: 'left',
            },
            {
                title: 'BU Code',
                dataIndex: 'buCode',
                key: 'buCode',
                width: 120,
                sorter: (a, b) => a.buCode.localeCompare(b.buCode),
                fixed: 'left',
            },
            {
                title: 'Accountable Area',
                dataIndex: 'accountableArea',
                key: 'accountableArea',
                width: 180,
                sorter: (a, b) => a.accountableArea.localeCompare(b.accountableArea),
                fixed: 'left',
            },
            {
                title: 'BU PIC Name',
                dataIndex: 'bupicName',
                key: 'bupicName',
                width: 150,
                sorter: (a, b) => a.bupicName.localeCompare(b.bupicName),
                fixed: 'left',
            },
        ];

        const createStatusColumns = status => [
            {
                title: 'Income',
                key: `${status}_income`,
                width: 100,
                align: 'right',
                render: (_, record) => {
                    const value = record[`${status}Income`] || 0;
                    const formattedValue = value.toLocaleString('en-US');
                    const className =
                        value === 0 || value > 0 ? 'positive-value' : 'negative-value';
                    return <span className={className}>{formattedValue}</span>;
                },
            },
            {
                title: 'Expense',
                key: `${status}_expense`,
                width: 100,
                align: 'right',
                render: (_, record) => {
                    const value = record[`${status}Expense`] || 0;
                    const formattedValue =
                        value > 0
                            ? `-${value.toLocaleString('en-US')}`
                            : value.toLocaleString('en-US');
                    const className = value === 0 ? 'positive-value' : 'negative-value';
                    return <span className={className}>{formattedValue}</span>;
                },
            },
            {
                title: 'Net',
                key: `${status}_net`,
                width: 100,
                align: 'right',
                render: (_, record) => {
                    const income = record[`${status}Income`] || 0;
                    const expense = record[`${status}Expense`] || 0;
                    const value = income - expense;
                    const formattedValue = value.toLocaleString('en-US');
                    let className;
                    if (value === 0) {
                        className = POSITIVE_VALUE_CLASS;
                    } else if (value < 0) {
                        className = NEGATIVE_VALUE_CLASS;
                    } else {
                        className = POSITIVE_VALUE_CLASS;
                    }
                    return <span className={className}>{formattedValue}</span>;
                },
            },
        ];

        return [
            ...baseColumns,
            {
                title: 'Confirmed',
                key: 'confirmed',
                className: 'confirmed-header',
                children: createStatusColumns('confirmed'),
            },
            {
                title: 'Pending',
                key: 'pending',
                className: 'pending-header',
                children: createStatusColumns('pending'),
            },
            {
                title: 'Rejected',
                key: 'rejected',
                className: 'rejected-header',
                children: createStatusColumns('rejected'),
            },
        ];
    };

    const columns = generateColumns();

    const handleMonthChange = date => {
        setSelectedMonth(date);
        if (date) {
            setFilters(prev => ({
                ...prev,
                month: date.format('YYYY-MM'),
            }));
        }
    };

    const handleBuChange = value => {
        if (!value) {
            return;
        }

        setSelectedBUId(value);
        setFilters(prev => ({
            ...prev,
            buId: value,
        }));
    };

    const handleExport = async () => {
        window.location.href = `/BU/ExportBUInvoiceSummary?month=${selectedMonth.format(
            'YYYY-MM'
        )}&buId=${selectedBUId}`;
    };

    const loadBuData = async () => {
        if (filters.buId && filters.buId <= 0) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get('/BU/GetBUInvoiceSummary', { params: filters });
            if (response?.data) {
                setBuData(response.data);
            }
        } catch (error) {
            // Error handling - silently fail
        } finally {
            setLoading(false);
        }
    };

    const loadBuList = async () => {
        const response = await axios.get('/BU/GetBUListByEmpId');
        if (response?.data && response.data.length > 0) {
            setBuList(response.data);
            // Select first BU as default
            const firstBUId = response.data[0].unitId;
            setSelectedBUId(firstBUId);
            setFilters(prev => ({
                ...prev,
                buId: firstBUId,
            }));
        }
    };

    useEffect(() => {
        loadBuData();
    }, [filters]);

    useEffect(() => {
        loadBuList();
    }, []);

    return (
        <div className="report-container">
            <ConfigProvider>
                <Card title={<Title level={4}>BU Invoice Summary</Title>} className="report-card">
                    <Filter
                        selectedMonth={selectedMonth}
                        selectedBUId={selectedBUId}
                        buList={buList}
                        loading={loading}
                        onMonthChange={handleMonthChange}
                        onBuChange={handleBuChange}
                        onExport={handleExport}
                    />
                    <Spin spinning={loading}>
                        <Table
                            className="bu-report-table"
                            columns={columns}
                            dataSource={buData}
                            pagination={false}
                            scroll={{
                                x: 'max-content',
                                y: buData && buData.length > 0 ? 'calc(100vh - 340px)' : undefined,
                            }}
                            bordered
                            rowKey={record => record.buId}
                            summary={renderSummaryRow}
                            sortDirections={['ascend', 'descend']}
                        />
                    </Spin>
                </Card>
            </ConfigProvider>
        </div>
    );
};

export default AppContainer;
