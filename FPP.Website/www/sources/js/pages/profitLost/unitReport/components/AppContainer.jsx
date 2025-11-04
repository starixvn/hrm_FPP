import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Select, Spin, ConfigProvider, Typography, Row, Col } from 'antd';
import axios from 'axios';
import { CategoryType } from '../../helper/enum';

const { Option } = Select;
const { Title } = Typography;

const AppContainer = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({ categories: [], totals: [] });
    const [units, setUnits] = useState([]);
    const [year, setYear] = useState(2025);
    const [groupUnitId, setGroupUnitId] = useState();

    const fetchProfitLostData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/ProfitLost/GetUnitProfitLost`, {
                params: {
                    groupUnitId,
                    year,
                },
            });
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

    const fetchUnits = async () => {
        try {
            const response = await axios.get(`/ProfitLost/GetAccessibleUnits`);
            setUnits(response.data);
        } catch (error) {
            console.info('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (groupUnitId) {
            fetchProfitLostData();
        }
    }, [groupUnitId, year]);

    useEffect(() => {
        fetchUnits();
    }, []);

    const months = useMemo(() => {
        if (data.categories.length > 0 && data.categories[0].monthlyTotalAmounts) {
            const monthKeys = Object.keys(data.categories[0].monthlyTotalAmounts);
            const monthOrder = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ];
            return monthKeys.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
        }
        return [];
    }, [data.categories]);

    const createSeparatorRow = key => {
        const separatorRow = {
            key,
            name: '',
            isSeparator: true,
        };
        months.forEach(month => {
            separatorRow[month] = '';
        });
        return separatorRow;
    };

    const renderFilters = () => (
        <Row className="report-filters" gutter={[32, 32]}>
            <Col span={8}>
                <div className="filter-option">
                    <div className="filter-label">BU</div>
                    <Select placeholder="Select BU" onChange={setGroupUnitId} value={groupUnitId}>
                        {units?.map(unit => (
                            <Option key={unit.groupUnitId} value={unit.groupUnitId}>
                                {unit.groupUnitId} - {unit.code}
                            </Option>
                        ))}
                    </Select>
                </div>
            </Col>
            <Col span={8}>
                <div className="filter-option">
                    <div className="filter-label">Year</div>
                    <Select placeholder="Year" onChange={setYear} value={year}>
                        <Option value="2024">2024</Option>
                        <Option value="2025">2025</Option>
                        <Option value="2026">2026</Option>
                    </Select>
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

        const monthColumns = months.map(month => ({
            title: month,
            dataIndex: month,
            key: month,
            width: 92,
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

        return [...baseColumns, ...monthColumns];
    }, [months]);

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

                    months.forEach(month => {
                        termRow[month] = term.monthlyAmounts?.[month] || 0;
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

                months.forEach(month => {
                    categoryRow[month] = category.monthlyTotalAmounts?.[month] || 0;
                });

                flatData.push(categoryRow);
            }

            // Thêm separator row sau mỗi category (trừ category cuối cùng)
            if (categoryIndex < data.categories.length - 1) {
                flatData.push(createSeparatorRow(`separator_${category.categoryId}`));
            }
        });

        return flatData;
    }, [data.categories, months]);

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

            months.forEach(month => {
                row[month] = total.monthAmounts?.[month] || 0;
            });

            return row;
        });
    };

    const tableData = useMemo(() => {
        if (!data.categories.length) {
            return [];
        }
        return dataSource.concat(formatTotalsFromBackend()).filter(Boolean);
    }, [dataSource, months, data.totals, data.categories.length]);

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
                <Card title={<Title level={4}>BU P&L Report</Title>} className="report-card">
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
