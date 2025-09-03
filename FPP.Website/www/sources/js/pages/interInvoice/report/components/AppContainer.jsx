import React, { useState, useEffect } from 'react';
import { Card, Table, Spin, ConfigProvider, DatePicker, Row, Col, Typography, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const { Title } = Typography;
const { Summary} = Table;

const AppContainer = () => {
    const [loading, setLoading] = useState(false);
    const [buData, setBuData] = useState([]);
    const currentMonth = dayjs();
    const [filters, setFilters] = useState({
        month: currentMonth.format('YYYY-MM')
    });
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const renderCostCenterValue = unitName => (_, record) => {
        const unitData = record.units?.find(u => u.name === unitName);
        const value = unitData ? unitData.value : 0;
        return (
            <span style={{ color: value < 0 ? '#ff4d4f' : 'inherit' }}>
                {value}
            </span>
        );
    };

    const renderSummaryRow = pageData => {
        if (!pageData || pageData.length === 0) {
            return null;
        }

        const totals = {};
        pageData.forEach(record => {
            if (record.units) {
                record.units.forEach(unit => {
                    totals[unit.name] = (totals[unit.name] || 0) + (unit.value || 0);
                });
            }
        });

        return (
            <Summary fixed>
                <Summary.Row>
                    <Summary.Cell index={0} colSpan={5} align="right">
                        Total
                    </Summary.Cell>
                    {buData?.[0]?.units?.map((unit, index) => (
                        <Summary.Cell key={`total_${index}`} index={index + 5} align="right">
                            <span style={{ 
                                color: totals[unit.name] < 0 ? '#ff4d4f' : 'inherit',
                                fontWeight: 'bold'
                            }}>
                                {totals[unit.name] || 0}
                            </span>
                        </Summary.Cell>
                    )) || []}
                </Summary.Row>
            </Summary>
        );
    };

    const generateColumns = () => {
        const baseColumns = [
        {
            title: 'BU',
            key: 'bu',
            width: 100,
            render: (_, record) => `${record.buId} - ${record.buCode}`,
            sorter: (a, b) => a.buId - b.buId,
            fixed: 'left'
        },
        {
            title: 'BU Category',
            dataIndex: 'buCategory',
            key: 'buCategory',
            width: 150,
            sorter: (a, b) => a.buCategory.localeCompare(b.buCategory),
            sortDirections: ['ascend', 'descend'],
            fixed: 'left'
        },
        {
            title: 'BU Type',
            dataIndex: 'buType',
            key: 'buType',
            width: 120,
            sorter: (a, b) => a.buType.localeCompare(b.buType),
            fixed: 'left'
        },
        {
            title: 'Accountable Area',
            dataIndex: 'accountableArea',
            key: 'accountableArea',
            width: 180,
            sorter: (a, b) => a.accountableArea.localeCompare(b.accountableArea),
            fixed: 'left'
        },
        {
            title: 'BU PIC Name',
            dataIndex: 'buPicName',
            key: 'buPicName',
            width: 150,
            sorter: (a, b) => a.buPicName.localeCompare(b.buPicName),
            fixed: 'left'
        },
        // {
        //     title: 'Description of Service',
        //     dataIndex: 'descriptionOfService',
        //     key: 'descriptionOfService',
        //     width: 250,
        //     sorter: (a, b) => a.descriptionOfService.localeCompare(b.descriptionOfService),
        // }
        ];

        // Generate cost center columns dynamically from first record's units
        const costCenterColumns = [];
        if (buData.length > 0 && buData[0].units) {
            buData[0].units.forEach((unit, index) => {
                costCenterColumns.push({
                    title: unit.name,
                    key: `unit_${index}`,
                    width: 105,
                    align: 'right',
                    render: renderCostCenterValue(unit.name)
                });
            });
        }

        return [...baseColumns, ...costCenterColumns];
    };

    const columns = generateColumns();

    const handleMonthChange = date => {
        setSelectedMonth(date);
        if (date) {
            setFilters(prev => ({
                ...prev,
                month: date.format('YYYY-MM')
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
        const response = await axios.get('/InterInvoice/GetInvoiceReport', { params: filters });
        if (response?.data) {
            setBuData(response.data);
        }
        
        setLoading(false);
    };

    const handleExport = async () => {
        window.location.href = await axios.get('/InterInvoice/ExportInvoiceReport', { params: filters });
    };

    useEffect(() => {
        loadBuData();
    }, [filters]);

    return (
        <div className="report-container">
            <ConfigProvider>
                <Card
                    title={<Title level={4}>Inter Invoice Report</Title>}
                    className="report-card"
                >
                    {renderFilters()}
                    <Spin spinning={loading}>
                        <Table
                            className="bu-report-table"
                            columns={columns}
                            dataSource={buData}
                            pagination={false}
                            scroll={{ x: 'max-content', y: 'calc(100vh - 320px)' }}
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
