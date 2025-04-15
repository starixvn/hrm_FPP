import React from 'react';
import { Row, Col, Card, Table, Space, Button, Select, DatePicker } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const months = [
    'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Jul-25', 
    'Aug-25', 'Sep-25', 'Oct-25', 'Nov-25', 'Dec-25'
];

const expenseCategories = {
    'Communication Exp': [
        'Courier Services',
        'Internet Services',
        'Other communications',
        'Postage Stamps',
        'Telephone Fax'
    ],
    'Cost of Sales Exp': [
        'Data Center Bandwidth',
        'Live Games Management',
        'Other Cost of Services',
        'Video Streaming',
        'Commission for BA',
        'Rebate for Licensees',
        'Lotto Tax'
    ],
    'Establishment Exp': [
        'Air-Conditioning Plant',
        'Asset Expenses',
        'Building on Fhold Land',
        'Computer HW',
        'Computer SW',
        'Expat Household Exp',
        'Furniture Fittings',
        'Insurance (Gen)',
        'Motor Vehicle Expenses',
        'Motor Vehicles',
        'OE Machineries',
        'Pantry Expenses',
        'Renovation',
        'Rental of Office',
        'Rental of Staff Condo',
        'Repair Maintenance',
        'Security Services',
        'Utility Expenses'
    ]
};

const columns = [
    {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        fixed: 'left',
        width: 200
    },
    ...months.map(month => ({
        title: month,
        dataIndex: month.toLowerCase(),
        key: month.toLowerCase(),
        width: 120,
        render: (value) => value || '0'
    }))
];

// Generate data structure
const generateData = () => {
    let data = [];
    let id = 1;

    // Add INCOME section header
    data.push({
        key: 'income-header',
        category: 'INCOME',
        isSection: true
    });

    // Add expense categories
    Object.entries(expenseCategories).forEach(([category, items]) => {
        // Add category header
        data.push({
            key: `${category}-header`,
            category: category.toUpperCase(),
            isSection: true
        });

        // Add category items
        items.forEach(item => {
            data.push({
                key: id++,
                category: item,
                ...months.reduce((acc, month) => {
                    acc[month.toLowerCase()] = '0';
                    return acc;
                }, {})
            });
        });

        // Add category total
        data.push({
            key: `${category}-total`,
            category: `${category} Total`,
            isTotal: true,
            ...months.reduce((acc, month) => {
                acc[month.toLowerCase()] = '0';
                return acc;
            }, {})
        });
    });

    return data;
};

const AppContainer = () => {
    return (
        <div className="p-4">
            {/* Header Section */}
            <Row justify="space-between" align="middle" className="mb-4">
                <Col>
                    <h2>Financial Dashboard</h2>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<PlusOutlined />} type="primary">
                            Add Entry
                        </Button>
                        <Button icon={<DownloadOutlined />}>
                            Export
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Filters Section */}
            <Card className="mb-4">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Select placeholder="Year" style={{ width: '100%' }} defaultValue="2025">
                            <Option value="2024">2024</Option>
                            <Option value="2025">2025</Option>
                            <Option value="2026">2026</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select placeholder="Category" style={{ width: '100%' }} allowClear>
                            {Object.keys(expenseCategories).map(category => (
                                <Option key={category} value={category}>{category}</Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </Card>

            {/* Main Content */}
            <Card>
                <Table 
                    columns={columns} 
                    dataSource={generateData()}
                    pagination={false}
                    scroll={{ x: 1500, y: 600 }}
                    rowClassName={(record) => {
                        if (record.isSection) return 'section-row';
                        if (record.isTotal) return 'total-row';
                        return '';
                    }}
                />
            </Card>
        </div>
    );
};

export default AppContainer; 