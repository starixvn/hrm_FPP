import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Spin, ConfigProvider, Typography, Row, Col, DatePicker } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';

const { Title } = Typography;

const AppContainer = () => {
    const [loading, setLoading] = useState(false);
    const [plData, setPLData] = useState([]);
    const currentMonth = dayjs();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const fetchPLData = async () => {
        try {
            setLoading(true);
            const params = {
                month: selectedMonth.format('YYYY-MM'),
            };
            const response = await axios.get(`/ProfitLost/GetProfitLost`, { params });
            setPLData(response.data);
        } catch (error) {
            console.info('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = date => {
        setSelectedMonth(date);
    };

    useEffect(() => {
        fetchPLData();
    }, [selectedMonth]);

    const bus = useMemo(() => {
        if (plData.length > 0 && plData[0].monthlyTotalAmounts) {
            return Object.keys(plData[0].monthlyTotalAmounts).sort();
        }
        return [];
    }, [plData]);

    const renderFilters = () => (
        <Row className="report-filters" gutter={[32, 32]}>
            <Col span={6}>
                <div className="filter-option">
                    <div className="filter-label">Month</div>
                    <DatePicker
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        format="YYYY-MM"
                        picker="month"
                        placeholder="Select Month"
                        style={{ width: '100%' }}
                        allowClear
                    />
                </div>
            </Col>
        </Row>
    );

    const columns = useMemo(() => {
        const baseColumns = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                fixed: 'left',
                width: 120,
                render: (text, record) => {
                    if (record.isCategory) {
                        return <strong>{text}</strong>;
                    } else if (record.isGrandTotal) {
                        return <strong>{text}</strong>;
                    } else {
                        return <span>{text}</span>;
                    }
                },
            },
        ];

        const buColumns = bus.map(bu => ({
            title: bu,
            dataIndex: bu,
            key: bu,
            width: 100,
            align: 'right',
            render: (text, record) => {
                const value = text || '0';
                const formattedValue = Number(value).toLocaleString('en-US');
                if (record.isCategory || record.isGrandTotal) {
                    return <strong>{formattedValue}</strong>;
                }
                return formattedValue;
            },
        }));

        return [...baseColumns, ...buColumns];
    }, [bus]);

    const dataSource = useMemo(() => {
        if (!plData.length) {
            return [];
        }

        const flatData = [];

        plData.forEach(category => {
            if (category.details && category.details.length) {
                category.details.forEach((term, termIndex) => {
                    const termRow = {
                        key: `term_${category.categoryId}_${termIndex}`,
                        name: term.termName,
                        isCategory: false,
                    };

                    bus.forEach(bu => {
                        termRow[bu] = term.buAmounts?.[bu] || 0;
                    });

                    flatData.push(termRow);
                });
            }

            const categoryRow = {
                key: `category_${category.categoryId}`,
                name: category.categoryName,
                isCategory: true,
            };

            bus.forEach(bu => {
                categoryRow[bu] = category.monthlyTotalAmounts?.[bu] || 0;
            });

            flatData.push(categoryRow);
        });

        return flatData;
    }, [plData, bus]);

    const calculateGrandTotals = () => {
        if (!plData.length) {
            return null;
        }

        const totalsRow = {
            key: 'grand_total',
            name: 'Grand Total',
            isGrandTotal: true,
        };

        bus.forEach(bu => {
            totalsRow[bu] = plData.reduce(
                (sum, category) => sum + (Number(category.monthlyTotalAmounts?.[bu]) || 0),
                0
            );
        });

        return totalsRow;
    };

    const tableData = useMemo(() => {
        return dataSource
            .filter(item => !item.isSeparator)
            .concat(calculateGrandTotals())
            .filter(Boolean);
    }, [dataSource, bus]);

    const getRowClassName = record => {
        if (record.isGrandTotal) {
            return 'grand-total-row';
        } else if (record.isCategory) {
            return 'category-row';
        }
        return '';
    };

    return (
        <div className="report-container">
            <ConfigProvider>
                <Card
                    title={<Title level={4}>BU P&L Consolidation Report</Title>}
                    className="report-card"
                >
                    {renderFilters()}

                    <Spin spinning={loading}>
                        <Table
                            className="pl-table"
                            columns={columns}
                            dataSource={tableData}
                            pagination={false}
                            scroll={{ x: 'max-content', y: 'calc(100vh - 324px)' }}
                            bordered
                            rowClassName={getRowClassName}
                            onRow={record => {
                                if (record?.isSeparator) {
                                    return {
                                        className: 'separator-row',
                                    };
                                }
                                return {};
                            }}
                        />
                    </Spin>
                </Card>
            </ConfigProvider>
        </div>
    );
};

export default AppContainer;
