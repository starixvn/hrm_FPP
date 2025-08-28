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
import {
    mapPeriodType,
    PeriodType,
    InterInvoiceStatus,
    mapInterInvoiceStatus,
} from '../../helper/enum';
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

                const initialItems = response.data.units.map(payer => ({
                    payerUnitId: payer.unitId,
                    itemDescription: '',
                    amount: null,
                }));
                form.setFieldsValue({ items: initialItems });

                if (response.data.currentEmpUnitId) {
                    form.setFieldsValue({
                        billerUnitId: response.data.currentEmpUnitId,
                    });
                }

                if (response.data.currencies && response.data.currencies.length > 0) {
                    form.setFieldsValue({
                        currencyId: response.data.currencies[0].id,
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

    const onFinish = async values => {
        const validItems = values.items.filter(
            item => item.itemDescription && item.amount !== null
        );

        const invalidItems = values.items.filter(
            item =>
                (item.itemDescription && !item.amount) ||
                (!item.itemDescription && item.amount !== null)
        );

        if (invalidItems.length > 0) {
            const invalidDetails = invalidItems.map(item => {
                const payer = payerOptions.find(p => p.unitId === item.payerUnitId);
                const unitName = payer
                    ? `${payer.groupUnitId} - ${payer.code}`
                    : `Unit ID: ${item.payerUnitId}`;

                if (item.itemDescription && !item.amount) {
                    return `${unitName} (missing amount)`;
                } else if (!item.itemDescription && item.amount !== null) {
                    return `${unitName} (missing description)`;
                }
                return unitName;
            });

            message.error(`Missing information: ${invalidDetails.join(', ')}.`);
            return;
        }

        if (validItems.length === 0) {
            message.error('Please fill in at least one description and amount');
            return;
        }

        try {
            const validItems = values.items.filter(
                item => item.itemDescription && item.amount !== null
            );

            const formData = {
                billerUnitId: values.billerUnitId,
                currencyId: values.currencyId,
                periodType: values.periodType,
                fromDate: null,
                toDate: null,
                notes: values.notes,
                items: validItems.map(item => ({
                    payerUnitId: item.payerUnitId,
                    itemDescription: item.itemDescription,
                    amount: item.amount,
                })),
            };

            switch (values.periodType) {
                case PeriodType.Monthly:
                    formData.fromDate = values.monthlyDate.startOf('month').format('YYYY-MM-DD');
                    formData.toDate = values.monthlyDate.startOf('month').format('YYYY-MM-DD');
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
            const response = await axios.post('/InterInvoice/CreateMultipleInvoice', formData);
            message.success(`Successfully created ${validItems.length} invoices`);
            form.resetFields();
            setTotalAmount(0);
        } catch (error) {
            message.error(error.response?.data || 'Failed to create invoice');
        }
    };

    if (loading)
        return (
            <div className="invoice-container">
                <Card className="invoice-form-card">
                    <div className="loading-container">
                        <Spin size="large" />
                        <div className="loading-text">Loading invoice data...</div>
                    </div>
                </Card>
            </div>
        );
    if (error)
        return (
            <div className="invoice-container">
                <Card className="invoice-form-card">
                    <div className="error-container">
                        <div className="error-text">{error}</div>
                    </div>
                </Card>
            </div>
        );

    return (
        <div className="invoice-container">
            <Card title="Create Multiple Inter Invoice" className="invoice-form-card">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}
                    onValuesChange={(changedValues, allValues) => {
                        const items = allValues.items || [];
                        const total = items
                            .filter(item => item && item.amount !== undefined)
                            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
                        setTotalAmount(total);
                    }}
                    className="invoice-form"
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="billerUnitId"
                                label="Biller"
                                rules={[{ required: true, message: 'Please select biller' }]}
                            >
                                <Select placeholder="Select Biller" disabled={!isGlobal}>
                                    {billerOptions.map(biller => (
                                        <Option key={biller.unitId} value={biller.unitId}>
                                            {biller.groupUnitId} - {biller.code}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="currencyId"
                                label="Currency"
                                rules={[{ required: true, message: 'Please select currency' }]}
                            >
                                <Select placeholder="Select Currency">
                                    {currencyOptions.map(currency => (
                                        <Option key={currency.id} value={currency.id}>
                                            {currency.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>BU Details</Divider>

                    <Form.List name="items" initialValue={[]}>
                        {(fields, { add, remove }) => (
                            <>
                                <div className="invoice-item-labels">
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <span className="ant-form-item-label">Payer</span>
                                        </Col>
                                        <Col span={8}>
                                            <span className="ant-form-item-label">Description</span>
                                        </Col>
                                        <Col span={6}>
                                            <span className="ant-form-item-label">Amount</span>
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
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'payerUnitId']}
                                                >
                                                    <Select
                                                        placeholder="Select Payer"
                                                        disabled
                                                        defaultValue={payerOptions[name]?.unitId}
                                                    >
                                                        {payerOptions.map(payer => (
                                                            <Option
                                                                key={payer.unitId}
                                                                value={payer.unitId}
                                                            >
                                                                {payer.groupUnitId} - {payer.code}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'itemDescription']}
                                                >
                                                    <Input placeholder="Description" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item {...restField} name={[name, 'amount']}>
                                                    <InputNumber
                                                        style={{ width: '100%' }}
                                                        placeholder="Amount"
                                                        formatter={value => {
                                                            if (!value) return '';
                                                            const num = parseFloat(value);
                                                            return Number.isInteger(num)
                                                                ? num.toString()
                                                                : num.toFixed(2);
                                                        }}
                                                        parser={value =>
                                                            value.replace(/[^\d.]/g, '')
                                                        }
                                                        controls={false}
                                                        step={0.01}
                                                        precision={2}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                                <Form.Item>
                                    <div className="invoice-total-amount">
                                        Total Amount: {CommonFunctions.formatCurrency(totalAmount)}{' '}
                                        {currencyOptions.find(
                                            c => c.id === form.getFieldValue('currencyId')
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
                        <Select onChange={value => setPeriodType(value)}>
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
                            name="monthlyDate"
                            label="Period Details"
                            rules={[{ required: true, message: 'Please select month' }]}
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
                            className="cancel-button"
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
