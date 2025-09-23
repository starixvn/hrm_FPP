import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Form,
    Input,
    Select,
    Button,
    Card,
    InputNumber,
    Divider,
    Row,
    Col,
    message,
    Space,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { PeriodType, InterInvoiceStatus } from '../../helper/enum';
import CommonFunctions from '../../../../common/common-functions';
import dayjs from 'dayjs';
import { calculateTotalAmount, getDateRange } from '../../helper/invoiceUtils';
import { ErrorState, LoadingState } from '../../shared/LoadingStates';
import { PeriodTypeFields } from '../../shared/PeriodType';

const { Option } = Select;

const AppContainer = () => {
    const [form] = Form.useForm();
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
                    console.info('Failed to unblock editing:', error);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const checkInvoiceEditPermission = invoiceData => {
        if (
            invoiceData.status !== InterInvoiceStatus.Pending ||
            (invoiceData.billerUnitId !== window.currentEmpUnitId &&
                !window.isGlobal &&
                !invoiceData.isBillerSupporter)
        ) {
            return false;
        }
        return true;
    };

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
                const hasEditPermission = checkInvoiceEditPermission(invoiceData);
                if (!hasEditPermission) {
                    await axios.put(`/InterInvoice/UnlockEditing?id=${window.invoiceId}`);
                    window.location.href = `/interInvoice/detail?id=${window.invoiceId}`;
                    return;
                }
                // Fetch prepared data
                const preparedResponse = await axios.get('/InterInvoice/GetPreparedData');
                setPayerOptions(
                    preparedResponse.data.units.filter(
                        unit => unit.picEmpId != null && unit.picEmpId > 0
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
                    items: invoiceData.items.map(item => ({
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
                setLoading(false);
            } catch (err) {
                setError(error.response?.data);
                setLoading(false);
            }
        };
        if (window.invoiceId) {
            fetchData();
        }
    }, [window.invoiceId]);

    const onFinish = async values => {
        if (values.items === undefined || values.items.length === 0) {
            message.error('Please add at least one item');
            return;
        }

        try {
            const { fromDate, toDate } = getDateRange(values);

            const formData = {
                ...values,
                interInvoiceId: parseInt(window.invoiceId, 10),
                fromDate,
                toDate,
                items: values.items.map(item => ({
                    interInvoiceId: window.invoiceId,
                    itemDescription: item.itemDescription,
                    amount: item.amount.toFixed(2),
                })),
            };
            await axios.put('/InterInvoice/UpdateInvoice', formData);
            window.location.href = `/interInvoice/detail?id=${window.invoiceId}`;
            message.success('Invoice updated successfully');
        } catch (error) {
            message.error(error.response?.data || 'Failed to update invoice');
        }
    };

    if (loading) {
        return <LoadingState message="Loading invoice data..." />;
    }
    if (error) {
        return <ErrorState error={error} />;
    }

    return (
        <div className="invoice-container">
            <Card title={`Edit Inter Invoice #${window.invoiceId}`} className="invoice-form-card">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}
                    onValuesChange={(_changedValues, allValues) => {
                        const items = allValues.items || [];
                        const total = calculateTotalAmount(items);
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
                                    {billerOptions.map(biller => (
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
                                label="Receiver"
                                rules={[{ required: true, message: 'Please select receiver' }]}
                            >
                                <Select placeholder="Select Receiver" disabled={true}>
                                    {payerOptions.map(payer => (
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
                                    {currencyOptions.map(currency => (
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
                                        <Col span={16}>
                                            <span className="ant-form-item-label">
                                                <span className="required-label">*</span> Item
                                                Description
                                            </span>
                                        </Col>
                                        <Col span={6} className="amount-label">
                                            <span className="ant-form-item-label amount-label">
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
                                            <Col span={16}>
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
                                            <Col span={6}>
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
                                                        formatter={value => {
                                                            if (!value) {
                                                                return '';
                                                            }
                                                            const num = parseFloat(value);
                                                            return num.toLocaleString('en-US', {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 2,
                                                            });
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
                                            <Col span={2} className="remove-item">
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
                                            c => c.id === form.getFieldValue('currencyId')
                                        )?.symbol || ''}
                                    </div>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <PeriodTypeFields />

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
