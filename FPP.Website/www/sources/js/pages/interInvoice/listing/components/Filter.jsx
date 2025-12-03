import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Select, Button, DatePicker } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { fetchBuList } from '../../helper/service';
import DateTimeService from '../../../../common/dateTimeService';

const { Option } = Select;

const Filter = ({ onFilter, onExportExcel, isHost, initialValues }) => {
    const [buList, setBuList] = useState([]);
    const [form] = Form.useForm();

    const loadBuList = async () => {
        const data = await fetchBuList();
        setBuList(data);
    };

    useEffect(() => {
        loadBuList();
    }, []);

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    const handleFilter = values => {
        const params = {
            billerUnitId: values.billerUnitId === 'all' ? undefined : values.billerUnitId,
            payerUnitId: values.payerUnitId === 'all' ? undefined : values.payerUnitId,
            month: values.month ? values.month : DateTimeService.getPreviousMonth(),
        };
        onFilter(params);
    };

    const handleExportExcel = values => {
        const params = {
            billerUnitId: values.billerUnitId === 'all' ? undefined : values.billerUnitId,
            payerUnitId: values.payerUnitId === 'all' ? undefined : values.payerUnitId,
            month: values.month ? values.month : DateTimeService.getPreviousMonth(),
        };
        onExportExcel(params);
    };

    const onClickCreate = href => {
        window.location.href = href;
    };

    return (
        <Form form={form} onFinish={handleFilter} layout="vertical" initialValues={initialValues}>
            <Row gutter={16} align="middle">
                <Col span={4}>
                    <Form.Item name="billerUnitId" label="Biller" initialValue="all">
                        <Select
                            placeholder="Select Biller"
                            onChange={value =>
                                handleFilter({
                                    ...form.getFieldsValue(),
                                    billerUnitId: value,
                                })
                            }
                        >
                            <Option value="all">All</Option>
                            {buList.map(bu => (
                                <Option key={bu.groupUnitId} value={bu.unitId}>
                                    {bu.groupUnitId} - {bu.code}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="payerUnitId" label="Payer" initialValue="all">
                        <Select
                            placeholder="Select Payer"
                            onChange={value =>
                                handleFilter({
                                    ...form.getFieldsValue(),
                                    payerUnitId: value,
                                })
                            }
                        >
                            <Option value="all">All</Option>
                            {buList.map(bu => (
                                <Option key={bu.groupUnitId} value={bu.unitId}>
                                    {bu.groupUnitId} - {bu.code}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="month" label="Month">
                        <DatePicker
                            onChange={value => {
                                form.setFieldValue('month', value);
                                handleFilter({
                                    ...form.getFieldsValue(),
                                    month: value,
                                });
                            }}
                            format="YYYY-MM"
                            picker="month"
                            placeholder="Select Month"
                            style={{ width: '100%' }}
                            allowClear
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => handleExportExcel(form.getFieldsValue())}
                    >
                        Export
                    </Button>
                </Col>
                {isHost && (
                    <Col span={8} className="create-button-group">
                        <div className="create-button-container">
                            <Button
                                type="primary"
                                onClick={() => onClickCreate('/interInvoice/create?isMultiple=1')}
                            >
                                Create Multiple Invoices
                            </Button>
                        </div>
                        <div className="create-button-container">
                            <Button
                                type="primary"
                                onClick={() => onClickCreate('/interInvoice/create')}
                            >
                                Create Invoice
                            </Button>
                        </div>
                    </Col>
                )}
            </Row>
        </Form>
    );
};

export default Filter;
