import React from 'react';
import { DatePicker, Row, Col, Button, Select } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const Filter = ({
    selectedMonth,
    selectedBUId,
    buList,
    loading,
    onMonthChange,
    onBuChange,
    onExport,
}) => {
    return (
        <div className="report-filters">
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={6} lg={4}>
                    <div className="filter-item">
                        <label htmlFor="bu-select">BU</label>
                        <Select
                            id="bu-select"
                            value={selectedBUId}
                            onChange={onBuChange}
                            placeholder="Select BU"
                            style={{ width: '100%' }}
                            options={buList.map(bu => ({
                                value: bu.unitId,
                                label: `${bu.groupUnitId} - ${bu.code}`,
                            }))}
                        />
                    </div>
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <div className="filter-item">
                        <label htmlFor="month-picker">Month</label>
                        <DatePicker
                            id="month-picker"
                            value={selectedMonth}
                            onChange={onMonthChange}
                            format="YYYY-MM"
                            picker="month"
                            placeholder="Select Month"
                        />
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <div className="filter-actions">
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={onExport}
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

export default Filter;
