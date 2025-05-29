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
    Space,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { InterInvoiceStatus, PeriodType, mapPeriodType } from '../../components/enum';
import CommonFunctions from '../../../../common/common-functions';
import moment from 'moment';
import dayjs from 'dayjs';

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
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const handleBeforeUnload = async () => {
            if (window.invoiceId) {
                try {
                    await axios.put(`/InterInvoice/UnlockEditing?id=${window.invoiceId}`);
                } catch (error) {
                    console.error('Failed to unblock editing:', error);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch invoice data
                const invoiceResponse = await axios.get(
                    `/InterInvoice/GetInvoice/${window.invoiceId}?isEdit=true`
                );

                const invoiceData = invoiceResponse.data;
                if (invoiceData.interInvoiceId === 0) {
                    window.location.href = `/Error/AccessDenied`;
                }
                if (
                    invoiceData.status !== InterInvoiceStatus.Pending ||
                    (invoiceData.billerUnitId !== window.currentEmpUnitId && !window.isGlobal)
                ) {
                    await axios.put(`/InterInvoice/UnlockEditing?id=${window.invoiceId}`);
                    window.location.href = `/interInvoice/detail?id=${window.invoiceId}`;
                }
                // Fetch prepared data
                const preparedResponse = await axios.get('/InterInvoice/GetPreparedData');
                setPayerOptions(
                    preparedResponse.data.units.filter(
                        (unit) => unit.picEmpId != null && unit.picEmpId > 0
                    ) || []
                );
                setBillerOptions(preparedResponse.data.units);
                setCurrencyOptions(preparedResponse.data.currencies || []);

                // Set form values
                const formValues = {
                    billerUnitId: invoiceData.billerUnitId,
                    payerUnitId: invoiceData.payerUnitId,
                    currencyId: invoiceData.currencyId,
                    periodType: invoiceData.periodType,
                    notes: invoiceData.notes,
                    items: invoiceData.items.map((item) => ({
                        itemDescription: item.itemDescription,
                        amount: item.amount,
                    })),
                };

                // Calculate initial total amount
                const initialTotal = invoiceData.items.reduce(
                    (sum, item) => sum + (Number(item.amount) || 0),
                    0
                );
                setTotalAmount(initialTotal);

                // Set date based on period type
                switch (invoiceData.periodType) {
                    case PeriodType.Monthly:
                        formValues.monthlyDate = dayjs(invoiceData.fromDate);
                        break;
                    case PeriodType.RangeDate:
                        form.setFieldsValue({
                            rangeDate: [dayjs(invoiceData.fromDate), dayjs(invoiceData.toDate)],
                        });
                        break;
                    case PeriodType.OneTime:
                        formValues.deliveryDate = dayjs(invoiceData.fromDate);
                        break;
                }

                form.setFieldsValue(formValues);
                setPeriodType(invoiceData.periodType);
                setLoading(false);
            } catch (err) {
                setError(error.response?.data || 'Failed to fetch data');
                setLoading(false);
            }
        };
        if (window.invoiceId) {
            fetchData();
        }
    }, [window.invoiceId]);

    const onFinish = async (values) => {
        if (values.items === undefined || values.items.length === 0) {
            message.error('Please add at least one item');
            return;
        }

        try {
            const formData = {
                ...values,
                interInvoiceId: parseInt(window.invoiceId),
                items: values.items.map((item) => ({
                    interInvoiceId: window.invoiceId,
                    itemDescription: item.itemDescription,
                    amount: item.amount.toFixed(2),
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
            const response = await axios.put('/InterInvoice/UpdateInvoice', formData);
            window.location.href = `/interInvoice/detail?id=${window.invoiceId}`;
            message.success('Invoice updated successfully');
        } catch (error) {
            message.error(error.response?.data || 'Failed to update invoice');
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
            <Card title={`Edit Inter Invoice #${window.invoiceId}`} className="invoice-form-card">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
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
                                rules={[{ required: true, message: 'Please select biller' }]}
                            >
                                <Select placeholder="Select Biller" disabled={true}>
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
                                rules={[{ required: true, message: 'Please select payer' }]}
                            >
                                <Select placeholder="Select Payer" disabled={true}>
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

                    <Form.List name="items">
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
                                                        formatter={(value) =>
                                                            `${value}`.replace(
                                                                /\B(?=(\d{3})+(?!\d))/g,
                                                                ','
                                                            )
                                                        }
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
                            <DatePicker
                                style={{ width: '100%' }}
                                showTime={false}
                                format="YYYY-MM-DD"
                            />
                        </Form.Item>
                    )}

                    <Form.Item name="notes" label="Notes">
                        <TextArea rows={4} placeholder="Enter any additional notes" />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Update Invoice
                            </Button>
                            <Button
                                type="default"
                                htmlType="submit"
                                onClick={() => {
                                    window.location.href = `/interInvoice/detail?id=${window.invoiceId}`;
                                }}
                            >
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AppContainer;
