import React, { useState, useEffect } from 'react';
import { Card, Table, Spin, ConfigProvider, DatePicker, Row, Col, Typography, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const { Title } = Typography;
const { Summary } = Table;

const AppContainer = () => {
    const [loading, setLoading] = useState(false);
    const [buData, setBuData] = useState([]);
    const currentMonth = dayjs();
    const [filters, setFilters] = useState({
        month: currentMonth.format('YYYY-MM'),
    });
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const renderSummaryRow = pageData => {
        if (!pageData || pageData.length === 0) {
            return null;
        }

        // Aggregate totals across all units
        const grandTotals = {
            confirmed: { income: 0, expense: 0, net: 0 },
            pending: { income: 0, expense: 0, net: 0 },
            rejected: { income: 0, expense: 0, net: 0 },
        };

        pageData.forEach(record => {
            if (record.units) {
                record.units.forEach(unit => {
                    // For now, putting all values in confirmed
                    // You may need to update backend to provide breakdown
                    grandTotals.confirmed.income += 0;
                    grandTotals.confirmed.expense += unit.value || 0;
                    grandTotals.confirmed.net += unit.value || 0;
                });
            }
        });

        const renderSummaryCell = (status, type) => {
            const value = grandTotals[status][type];
            const formattedTotal = value.toLocaleString('en-US');
            const className =
                value < 0
                    ? 'summary-value-negative summary-value-bold'
                    : 'summary-value-positive summary-value-bold';
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
                    {/* Confirmed columns */}
                    {renderSummaryCell('confirmed', 'income')}
                    {renderSummaryCell('confirmed', 'expense')}
                    {renderSummaryCell('confirmed', 'net')}
                    {/* Pending columns */}
                    {renderSummaryCell('pending', 'income')}
                    {renderSummaryCell('pending', 'expense')}
                    {renderSummaryCell('pending', 'net')}
                    {/* Rejected columns */}
                    {renderSummaryCell('rejected', 'income')}
                    {renderSummaryCell('rejected', 'expense')}
                    {renderSummaryCell('rejected', 'net')}
                    {/* Empty last column */}
                    <Summary.Cell />
                </Summary.Row>
            </Summary>
        );
    };

    const generateColumns = () => {
        const baseColumns = [
            {
                title: 'BU ID ',
                key: 'buId',
                width: 90,
                render: (_, record) => `${record.buId}  `,
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
                dataIndex: 'buPicName',
                key: 'buPicName',
                width: 150,
                sorter: (a, b) => a.buPicName.localeCompare(b.buPicName),
                fixed: 'left',
            },
        ];

        // Create renderer for status columns
        const createStatusColumns = status => [
            {
                title: 'Income',
                key: `${status}_income`,
                width: 100,
                align: 'right',
                render: (_, record) => {
                    const unitData = record.units?.[0];
                    const value = unitData
                        ? status === 'confirmed'
                            ? Math.abs(unitData.value)
                            : 0
                        : 0;
                    const formattedValue = value.toLocaleString('en-US');
                    const className = value < 0 ? 'negative-value' : 'positive-value';
                    return <span className={className}>{formattedValue}</span>;
                },
            },
            {
                title: 'Expense',
                key: `${status}_expense`,
                width: 100,
                align: 'right',
                render: (_, record) => {
                    const unitData = record.units?.[0];
                    const value = unitData ? (status === 'confirmed' ? unitData.value : 0) : 0;
                    const formattedValue = value.toLocaleString('en-US');
                    const className = value < 0 ? 'negative-value' : 'positive-value';
                    return <span className={className}>{formattedValue}</span>;
                },
            },
            {
                title: 'Net',
                key: `${status}_net`,
                width: 100,
                align: 'right',
                render: (_, record) => {
                    const unitData = record.units?.[0];
                    const value = unitData ? (status === 'confirmed' ? unitData.value : 0) : 0;
                    const formattedValue = value.toLocaleString('en-US');
                    const className =
                        value < 0
                            ? 'negative-value summary-value-bold'
                            : 'positive-value summary-value-bold';
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

    const renderFilters = () => {
        return (
            <div className="report-filters">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <div className="filter-item">
                            <label htmlFor="month-picker">Month</label>
                            <DatePicker
                                id="month-picker"
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                format="YYYY-MM"
                                picker="month"
                                placeholder="Select Month"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <div className="filter-actions">
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={handleExport}
                                loading={loading}
                            >
                                Export
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    };

    const loadBuData = async () => {
        setLoading(true);
        const response = await axios.get('/BUInvoice/GetBUInvoiceSummary', { params: filters });
        if (response?.data) {
            setBuData(response.data);
        }

        setLoading(false);
    };

    const handleExport = async () => {
        window.location.href = `/BUInvoice/ExportBUInvoiceSummary?month=${selectedMonth.format(
            'YYYY-MM'
        )}`;
    };

    useEffect(() => {
        loadBuData();
    }, [filters]);

    return (
        <div className="report-container">
            <ConfigProvider>
                <Card title={<Title level={4}>BU Invoice Summary</Title>} className="report-card">
                    {renderFilters()}
                    <Spin spinning={loading}>
                        <Table
                            className="bu-report-table"
                            columns={columns}
                            dataSource={buData}
                            pagination={false}
                            scroll={{ x: 'max-content', y: 'calc(100vh - 340px)' }}
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
