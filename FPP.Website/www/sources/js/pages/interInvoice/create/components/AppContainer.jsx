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
import { mapPeriodType, PeriodType } from '../../helper/enum';
import CommonFunctions from '../../../../common/common-functions';
import { calculateTotalAmount, getDateRange } from '../../helper/invoiceUtils';
import { ErrorState, LoadingState } from '../../shared/LoadingStates';

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

    const getIsMultiple = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('isMultiple') === '1';
    };

    const isMultiple = getIsMultiple();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/InterInvoice/GetPreparedData');
                setPayerOptions(response.data.units);
                setBillerOptions(response.data.units);
                setCurrencyOptions(response.data.currencies || []);
                setIsGlobal(response.data.isGlobal);

                if (isMultiple) {
                    const initialItems = response.data.units.map(payer => ({
                        payerUnitId: payer.unitId,
                        itemDescription: '',
                        amount: null,
                    }));
                    form.setFieldsValue({ items: initialItems });
                } else {
                    form.setFieldsValue({
                        items: [{ itemDescription: '', amount: null }],
                    });
                }

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
    }, [isMultiple]);

    const validateMultipleItems = values => {
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
            return { isValid: false, validItems: [] };
        }

        if (validItems.length === 0) {
            message.error('Please fill in at least one description and amount');
            return { isValid: false, validItems: [] };
        }

        return { isValid: true, validItems };
    };

    const handleMultipleInvoiceCreation = async (formData, validItems) => {
        try {
            await axios.post('/InterInvoice/CreateMultipleInvoice', formData);
            message.success(`Successfully created ${validItems.length} invoices`);
            window.location.href = `/interInvoice`;
        } catch (error) {
            message.error(error.response?.data || 'Failed to create invoice');
        }
    };

    const handleSingleInvoiceCreation = async formData => {
        if (formData.items === undefined || formData.items.length === 0) {
            message.error('Please add at least one item');
            return;
        }

        try {
            const response = await axios.post('/InterInvoice/CreateInvoice', formData);
            window.location.href = `/interInvoice/detail?id=${response.data.outputId}`;
        } catch (error) {
            message.error(error.response?.data || 'Failed to create invoice');
        }
    };

    const onFinish = async values => {
        const { fromDate, toDate } = getDateRange(values);

        const formData = {
            ...values,
            fromDate,
            toDate,
            notes: values.notes,
        };

        if (isMultiple) {
            const { isValid, validItems } = validateMultipleItems(values);
            if (!isValid) {
                return;
            }

            formData.items = validItems.map(item => ({
                payerUnitId: item.payerUnitId,
                itemDescription: item.itemDescription,
                amount: item.amount,
            }));

            await handleMultipleInvoiceCreation(formData, validItems);
        } else {
            await handleSingleInvoiceCreation(formData);
        }

        form.resetFields();
        setTotalAmount(0);
    };

    const renderPeriodTypeFields = () => {
        return (
            <>
                <Form.Item
                    name="periodType"
                    label="Billing Period"
                    initialValue={PeriodType.Monthly}
                >
                    <Select onChange={value => setPeriodType(value)}>
                        <Option value={PeriodType.Monthly}>
                            {mapPeriodType[PeriodType.Monthly]}
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
            </>
        );
    };

    const renderInvoiceItems = () => {
        return (
            <Form.List
                name="items"
                initialValue={isMultiple ? [] : [{ itemDescription: '', amount: null }]}
            >
                {(fields, { add, remove }) => (
                    <>
                        <div className="invoice-item-labels">
                            <Row gutter={16}>
                                {isMultiple && (
                                    <Col span={8}>
                                        <span className="ant-form-item-label">Payer</span>
                                    </Col>
                                )}
                                <Col span={isMultiple ? 8 : 16}>
                                    <span className="ant-form-item-label">
                                        <span className="required-label">*</span>
                                        {isMultiple ? 'Description' : 'Item Description'}
                                    </span>
                                </Col>
                                <Col span={6}>
                                    <span className="ant-form-item-label">
                                        <span className="required-label">*</span> Amount
                                    </span>
                                </Col>
                                {!isMultiple && (
                                    <Col span={2} className="remove-item">
                                        <span></span>
                                    </Col>
                                )}
                            </Row>
                        </div>
                        {fields.map(({ key, name, ...restField }) => (
                            <div key={key} className="invoice-item">
                                <Row gutter={16} align="middle" className="invoice-item-row">
                                    {isMultiple && (
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'payerUnitId']}>
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
                                    )}
                                    <Col span={isMultiple ? 8 : 16}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'itemDescription']}
                                            rules={
                                                isMultiple
                                                    ? []
                                                    : [
                                                          {
                                                              required: true,
                                                              message: 'Missing description',
                                                          },
                                                      ]
                                            }
                                        >
                                            <Input
                                                placeholder={
                                                    isMultiple ? 'Description' : 'Item Description'
                                                }
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'amount']}
                                            rules={
                                                isMultiple
                                                    ? []
                                                    : [
                                                          {
                                                              required: true,
                                                              message: 'Missing amount',
                                                          },
                                                      ]
                                            }
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Amount"
                                                formatter={value => {
                                                    if (!value) {
                                                        return '';
                                                    }
                                                    const num = parseFloat(value);
                                                    return Number.isInteger(num)
                                                        ? num.toString()
                                                        : num.toFixed(2);
                                                }}
                                                parser={value => value.replace(/[^\d.]/g, '')}
                                                controls={false}
                                                step={0.01}
                                                precision={2}
                                            />
                                        </Form.Item>
                                    </Col>
                                    {!isMultiple && (
                                        <Col span={2} className="remove-item">
                                            {fields.length > 1 && (
                                                <MinusCircleOutlined onClick={() => remove(name)} />
                                            )}
                                        </Col>
                                    )}
                                </Row>
                            </div>
                        ))}
                        {!isMultiple && (
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
                        )}
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
        );
    };

    if (loading) {
        return <LoadingState message="Loading invoice data..." />;
    }
    if (error) {
        return <ErrorState error={error} />;
    }

    return (
        <div className="invoice-container">
            <Card title="Create Inter Invoice" className="invoice-form-card">
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
                                rules={[
                                    { required: true, message: 'Please select biller' },
                                    ...(isMultiple
                                        ? []
                                        : [
                                              ({ getFieldValue }) => ({
                                                  validator(_, value) {
                                                      if (
                                                          !value ||
                                                          getFieldValue('payerUnitId') !== value
                                                      ) {
                                                          return Promise.resolve();
                                                      }
                                                      return Promise.reject(
                                                          new Error(
                                                              'Biller and Payer cannot be the same'
                                                          )
                                                      );
                                                  },
                                              }),
                                          ]),
                                ]}
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
                        {!isMultiple && (
                            <Col span={8}>
                                <Form.Item
                                    name="payerUnitId"
                                    label="Payer"
                                    rules={[
                                        { required: true, message: 'Please select payer' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (
                                                    !value ||
                                                    getFieldValue('billerUnitId') !== value
                                                ) {
                                                    const selectedPayer = payerOptions.find(
                                                        p => p.unitId === value
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
                                        {payerOptions.map(payer => (
                                            <Option key={payer.unitId} value={payer.unitId}>
                                                {payer.groupUnitId} - {payer.code}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        )}
                        <Col span={8}>
                            <Form.Item
                                name="currencyId"
                                label="Currency"
                                rules={[{ required: true, message: 'Please select currency' }]}
                            >
                                <Select placeholder="Select Currency">
                                    {currencyOptions.map(currency => (
                                        <Option key={currency.id} value={currency.id}>
                                            {isMultiple
                                                ? currency.name
                                                : `${currency.name} - ${currency.symbol}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>{isMultiple ? 'BU Details' : 'Service Details'}</Divider>

                    {renderInvoiceItems()}

                    <Divider>Billing Period</Divider>

                    {renderPeriodTypeFields()}

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
