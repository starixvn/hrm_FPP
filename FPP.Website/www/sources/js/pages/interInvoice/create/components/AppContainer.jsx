import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Form,
    Input,
    Select,
    DatePicker,
    Button,
    Card,
    InputNumber,
    Divider,
    Row,
    Col,
    message,
    Spin,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { PeriodType, mapPeriodType } from '../../components/enum';
import CommonFunctions from '../../../../common/common-functions';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AppContainer = () => {
    const [form] = Form.useForm();
    const [periodType, setPeriodType] = useState(PeriodType.Monthly);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payerOptions, setPayerOptions] = useState([]);
    const [billerOptions, setBillerOptions] = useState([]);
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [isGlobal, setIsGlobal] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/InterInvoice/GetPreparedData');
                setPayerOptions(response.data.units);
                setBillerOptions(response.data.units);
                setCurrencyOptions(response.data.currencies || []);
                setIsGlobal(response.data.isGlobal);

                if (!response.data.isGlobal && response.data.currentEmpUnitId) {
                    form.setFieldsValue({
                        billerUnitId: response.data.currentEmpUnitId,
                    });
                }

                setLoading(false);
            } catch (err) {
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const onFinish = async (values) => {
        if (values.items === undefined || values.items.length === 0) {
            message.error('Please add at least one item');
            return;
        }

        try {
            const formData = {
                ...values,
                fromDate: null,
                toDate: null,
                notes: values.notes,
                items: values.items.map((item) => ({
                    itemDescription: item.itemDescription,
                    amount: item.amount,
                })),
            };

            switch (values.periodType) {
                case PeriodType.Monthly:
                    formData.fromDate = values.monthlyDate.format('YYYY-MM-DD');
                    formData.toDate = values.monthlyDate.format('YYYY-MM-DD');
                    break;
                case PeriodType.RangeDate:
                    formData.fromDate = values.rangeDate[0].format('YYYY-MM-DD');
                    formData.toDate = values.rangeDate[1].format('YYYY-MM-DD');
                    break;
                case PeriodType.OneTime:
                    formData.fromDate = values.deliveryDate.format('YYYY-MM-DD');
                    formData.toDate = values.deliveryDate.format('YYYY-MM-DD');
                    break;
            }
            const response = await axios.post('/InterInvoice/CreateInvoice', formData);
            form.resetFields();
            window.location.href = `/interInvoice/detail?id=${response.data.outputId}`;
        } catch (error) {
            message.error(error.response?.data || 'Failed to create invoice');
        }
    };

    if (loading)
        return (
            <div className="invoice-container">
                <Card className="invoice-form-card">
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: '20px', fontSize: '16px', color: '#666' }}>
                            Loading invoice data...
                        </div>
                    </div>
                </Card>
            </div>
        );
    if (error)
        return (
            <div className="invoice-container">
                <Card className="invoice-form-card">
                    <div style={{ textAlign: 'center', padding: '50px 0', color: '#ff4d4f' }}>
                        <div style={{ fontSize: '16px' }}>{error}</div>
                    </div>
                </Card>
            </div>
        );

    return (
        <div className="invoice-container">
            <Card title="Create Inter Invoice" className="invoice-form-card">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}
                    onValuesChange={(changedValues, allValues) => {
                        const items = allValues.items || [];
                        const total = items
                            .filter((item) => item && item.amount !== undefined)
                            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
                        setTotalAmount(total);
                    }}
                    className="invoice-form"
                >
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item
                                name="billerUnitId"
                                label="Biller"
                                rules={[
                                    { required: true, message: 'Please select biller' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('payerUnitId') !== value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(
                                                new Error('Biller and Payer cannot be the same')
                                            );
                                        },
                                    }),
                                ]}
                            >
                                <Select placeholder="Select Biller" disabled={!isGlobal}>
                                    {billerOptions.map((biller) => (
                                        <Option key={biller.unitId} value={biller.unitId}>
                                            {biller.groupUnitId} - {biller.code}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="payerUnitId"
                                label="Payer"
                                rules={[
                                    { required: true, message: 'Please select payer' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('billerUnitId') !== value) {
                                                const selectedPayer = payerOptions.find(
                                                    (p) => p.unitId === value
                                                );
                                                if (!selectedPayer?.picEmpId) {
                                                    return Promise.reject(
                                                        new Error('This BU does not have a PIC')
                                                    );
                                                }
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(
                                                new Error('Biller and Payer cannot be the same')
                                            );
                                        },
                                    }),
                                ]}
                            >
                                <Select placeholder="Select Payer">
                                    {payerOptions.map((payer) => (
                                        <Option key={payer.unitId} value={payer.unitId}>
                                            {payer.groupUnitId} - {payer.code}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="currencyId"
                                label="Currency"
                                rules={[{ required: true, message: 'Please select currency' }]}
                            >
                                <Select placeholder="Select Currency">
                                    {currencyOptions.map((currency) => (
                                        <Option key={currency.id} value={currency.id}>
                                            {currency.name} - {currency.symbol}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Service Details</Divider>

                    <Form.List name="items" initialValue={[{ itemDescription: '', amount: null }]}>
                        {(fields, { add, remove }) => (
                            <>
                                <div
                                    className="invoice-item-labels"
                                    style={{ marginBottom: '8px' }}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={24} md={14} lg={14} xl={12} xxl={8}>
                                            <span className="ant-form-item-label">
                                                <span className="required-label">*</span> Item
                                                Description
                                            </span>
                                        </Col>
                                        <Col xs={16} sm={16} md={6} lg={6} xl={5} xxl={4}>
                                            <span className="ant-form-item-label">
                                                <span className="required-label">*</span> Amount
                                            </span>
                                        </Col>
                                    </Row>
                                </div>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} className="invoice-item">
                                        <Row
                                            gutter={16}
                                            align="middle"
                                            className="invoice-item-row"
                                        >
                                            <Col xs={24} sm={24} md={14} lg={14} xl={12} xxl={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'itemDescription']}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: 'Missing description',
                                                        },
                                                    ]}
                                                >
                                                    <Input placeholder="Item Description" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={16} sm={16} md={6} lg={6} xl={5} xxl={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'amount']}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: 'Missing amount',
                                                        },
                                                    ]}
                                                >
                                                    <InputNumber
                                                        style={{ width: '100%' }}
                                                        placeholder="Amount"
                                                        // formatter={(value) =>
                                                        //     `${value}`.replace(
                                                        //         /\B(?=(\d{3})+(?!\d))/g,
                                                        //         ','
                                                        //     )
                                                        // }
                                                        formatter={(value) => {
                                                            if (!value) return '';
                                                            const num = parseFloat(value);
                                                            return Number.isInteger(num)
                                                                ? num.toString()
                                                                : num.toFixed(2);
                                                        }}
                                                        parser={(value) =>
                                                            value.replace(/[^\d.]/g, '')
                                                        }
                                                        controls={false}
                                                        step={0.01}
                                                        precision={2}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col
                                                xs={8}
                                                sm={8}
                                                md={4}
                                                lg={4}
                                                xl={4}
                                                className="remove-item"
                                            >
                                                {fields.length > 1 && (
                                                    <MinusCircleOutlined
                                                        onClick={() => remove(name)}
                                                    />
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        Add Item
                                    </Button>
                                </Form.Item>
                                <Form.Item>
                                    <div className="invoice-total-amount">
                                        Total Amount: {CommonFunctions.formatCurrency(totalAmount)}{' '}
                                        {currencyOptions.find(
                                            (c) => c.id === form.getFieldValue('currencyId')
                                        )?.symbol || ''}
                                    </div>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Divider>Billing Period</Divider>

                    <Form.Item
                        name="periodType"
                        label="Billing Period"
                        initialValue={PeriodType.Monthly}
                    >
                        <Select onChange={(value) => setPeriodType(value)}>
                            <Option value={PeriodType.Monthly}>
                                {mapPeriodType[PeriodType.Monthly]}
                            </Option>
                            <Option value={PeriodType.RangeDate}>
                                {mapPeriodType[PeriodType.RangeDate]}
                            </Option>
                            <Option value={PeriodType.OneTime}>
                                {mapPeriodType[PeriodType.OneTime]}
                            </Option>
                        </Select>
                    </Form.Item>

                    {periodType === PeriodType.Monthly && (
                        <Form.Item
                            hidden
                            name="monthlyDate"
                            label="Period Details"
                            rules={[{ required: true, message: 'Please select month' }]}
                            initialValue={moment()}
                        >
                            <DatePicker picker="month" style={{ width: '100%' }} />
                        </Form.Item>
                    )}

                    {periodType === PeriodType.RangeDate && (
                        <Form.Item
                            name="rangeDate"
                            label="Period Details"
                            rules={[{ required: true, message: 'Please select date range' }]}
                        >
                            <RangePicker style={{ width: '100%' }} />
                        </Form.Item>
                    )}

                    {periodType === PeriodType.OneTime && (
                        <Form.Item
                            name="deliveryDate"
                            label="Delivery Date"
                            rules={[{ required: true, message: 'Please select delivery date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    )}

                    <Form.Item name="notes" label="Notes">
                        <TextArea rows={4} placeholder="Enter any additional information here" />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Button
                            style={{ marginRight: '8px' }}
                            onClick={() => (window.location.href = '/interInvoice/index')}
                        >
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Create Invoice
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AppContainer;
