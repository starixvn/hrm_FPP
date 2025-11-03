import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Spin, ConfigProvider, Typography, Row, Col, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';
import { CategoryType } from '../../helper/enum';
import { DownloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AppContainer = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({ categories: [], totals: [] });
    const currentMonth = dayjs();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const fetchPLData = async () => {
        try {
            setLoading(true);
            const params = {
                month: selectedMonth.format('YYYY-MM'),
            };
            const response = await axios.get(`/ProfitLost/GetProfitLost`, { params });
            setData({
                categories: response.data.categories || [],
                totals: response.data.totals || [],
            });
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
        if (data.categories.length > 0 && data.categories[0].monthlyTotalAmounts) {
            return Object.keys(data.categories[0].monthlyTotalAmounts).sort();
        }
        return [];
    }, [data.categories]);

    const createSeparatorRow = key => {
        const separatorRow = {
            key,
            name: '',
            isSeparator: true,
        };
        bus.forEach(bu => {
            separatorRow[bu] = '';
        });
        return separatorRow;
    };

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
                    <Button
                        className="btn-download"
                        type="default"
                        icon={<DownloadOutlined />}
                        onClick={() => {
                            window.location.href = `/ProfitLost/ExportProfitLost?month=${selectedMonth.format('YYYY-MM')}`;
                        }}
                    >
                        Export Excel
                    </Button>
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
                width: 190,
                render: (text, record) => {
                    if (record.isSeparator) {
                        return null;
                    }
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
            width: 92,
            align: 'right',
            render: (text, record) => {
                if (record.isSeparator) {
                    return null;
                }
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
        if (!data.categories.length) {
            return [];
        }

        const flatData = [];

        data.categories.forEach((category, categoryIndex) => {
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

            // Không hiển thị sum tổng của category nếu là Metadata
            if (category.categoryType !== CategoryType.Metadata) {
                const categoryRow = {
                    key: `category_${category.categoryId}`,
                    name: category.categoryName,
                    isCategory: true,
                };

                bus.forEach(bu => {
                    categoryRow[bu] = category.monthlyTotalAmounts?.[bu] || 0;
                });

                flatData.push(categoryRow);
            }

            // Thêm separator row sau mỗi category (trừ category cuối cùng)
            if (categoryIndex < data.categories.length) {
                flatData.push(createSeparatorRow(`separator_${category.categoryId}`));
            }
        });

        return flatData;
    }, [data.categories, bus]);

    const formatTotalsFromBackend = () => {
        if (!data.totals.length) {
            return [];
        }

        return data.totals.map((total, index) => {
            const row = {
                key: `total_${index}`,
                name: total.name,
                isGrandTotal: true,
            };

            bus.forEach(bu => {
                row[bu] = total.buAmounts?.[bu] || 0;
            });

            return row;
        });
    };

    const tableData = useMemo(
        () => dataSource.concat(formatTotalsFromBackend()).filter(Boolean),
        [dataSource, bus, data.totals]
    );

    const getRowClassName = record => {
        if (record.isSeparator) {
            return 'separator-row';
        }
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
                        />
                    </Spin>
                </Card>
            </ConfigProvider>
        </div>
    );
};

export default AppContainer;
