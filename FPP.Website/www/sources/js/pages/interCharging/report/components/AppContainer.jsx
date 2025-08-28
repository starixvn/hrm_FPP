import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Select, Spin, ConfigProvider, Typography, Row, Col, DatePicker } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;
const { Title } = Typography;
const { MonthPicker } = DatePicker;

const AppContainer = () => {
    const [loading, setLoading] = useState(false);
    const [interChargingData, setInterChargingData] = useState([]);
    const [unitData, setUnitData] = useState([]);
    const [selectedDate, setSelectedDate] = useState();
    const [groupUnitId, setGroupUnitId] = useState();

    const fetchCostExpenseData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/InterCharging/GetInterCharging`, {
                params: {
                    groupUnitId,
                    month: selectedDate ? selectedDate.format('YYYY-MM') : undefined,
                },
            });
            setInterChargingData(response.data);
        } catch (error) {
            console.info('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnitData = async () => {
        try {
            const response = await axios.get(`/InterCharging/GetUnits`);
            setUnitData(response.data);
        } catch (error) {
            console.info('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (groupUnitId) {
            fetchCostExpenseData();
        }
    }, [groupUnitId, selectedDate]);

    useEffect(() => {
        fetchUnitData();
    }, []);

    const renderFilters = () => (
        <Row className="report-filters" gutter={[32, 32]}>
            <Col span={8}>
                <div className="filter-option">
                    <div className="filter-label">BU</div>
                    <Select placeholder="Select BU" onChange={setGroupUnitId} value={groupUnitId}>
                        {unitData?.map(unit => (
                            <Option key={unit.unitId} value={unit.unitId}>
                                {unit.groupUnitId} - {unit.code}
                            </Option>
                        ))}
                    </Select>
                </div>
            </Col>
            <Col span={8}>
                <div className="filter-option">
                    <div className="filter-label">Month</div>
                    <MonthPicker
                        placeholder="Select month"
                        onChange={setSelectedDate}
                        value={selectedDate}
                        format="YYYY-MM"
                        style={{ width: '100%' }}
                    />
                </div>
            </Col>
        </Row>
    );

    const columns = useMemo(() => {
        return [
            {
                title: 'BU ID',
                dataIndex: 'chargedGroupUnitId',
                key: 'chargedGroupUnitId',
                width: 200,
            },
            {
                title: 'BU Code',
                dataIndex: 'chargedGroupUnitCode',
                key: 'chargedGroupUnitCode',
                width: 200,
            },
            {
                title: 'Month',
                dataIndex: 'month',
                key: 'month',
                width: 120,
                render: text => moment(text).format('MMM YYYY'),
            },
            {
                title: 'Remark',
                dataIndex: 'remark',
                key: 'remark',
                width: 200,
            },
            {
                title: 'Amount',
                dataIndex: 'amount',
                key: 'amount',
                width: 120,
                align: 'right',
                render: text => (
                    <span style={{ color: Number(text) < 0 ? 'red' : 'green' }}>
                        {Number(text).toLocaleString('en-US')}
                    </span>
                ),
            },
        ];
    }, []);

    return (
        <div className="report-container">
            <ConfigProvider>
                <Card
                    title={<Title level={4}>Inter Charging Report</Title>}
                    className="report-card"
                >
                    {renderFilters()}

                    <Spin spinning={loading}>
                        <Table
                            className="inter-charging-table"
                            columns={columns}
                            dataSource={interChargingData}
                            pagination={false}
                            scroll={{ x: 'max-content', y: 'calc(100vh - 324px)' }}
                            bordered
                            rowKey={record => record.chargedGroupUnitId}
                        />
                    </Spin>
                </Card>
            </ConfigProvider>
        </div>
    );
};

export default AppContainer;
