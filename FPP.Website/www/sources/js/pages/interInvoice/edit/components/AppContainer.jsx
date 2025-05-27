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
import moment from 'moment';
import { useParams } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AppContainer = () => {
    const [form] = Form.useForm();
    const { id } = useParams();
    const [periodType, setPeriodType] = useState(PeriodType.Monthly);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payerOptions, setPayerOptions] = useState([]);
    const [billerOptions, setBillerOptions] = useState([]);
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [isGlobal, setIsGlobal] = useState(false);
    const [currentEmpUnitId, setCurrentEmpUnitId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch invoice data
                const invoiceResponse = await axios.get(`/InterInvoice/GetInvoice/${id}`);
                const invoiceData = invoiceResponse.data;

                // Fetch prepared data
                const preparedResponse = await axios.get('/InterInvoice/GetPreparedData');
                setPayerOptions(
                    preparedResponse.data.units.filter(
                        (unit) => unit.picEmpId != null && unit.picEmpId > 0
                    ) || []
                );
                setBillerOptions(preparedResponse.data.units);
                setCurrencyOptions(preparedResponse.data.currencies || []);
                setIsGlobal(preparedResponse.data.isGlobal);
                setCurrentEmpUnitId(preparedResponse.data.currentEmpUnitId);

                // Set form values
                const formValues = {
                    billerUnitId: invoiceData.billerUnitId,
                    payerUnitId: invoiceData.payerUnitId,
                    currencyId: invoiceData.currencyId,
                    periodType: invoiceData.periodType,
                    notes: invoiceData.notes,
                    items: invoiceData.items.map((item) => ({
                        description: item.itemDescription,
                        amount: item.amount,
                    })),
                };

                // Set date based on period type
                switch (invoiceData.periodType) {
                    case PeriodType.Monthly:
                        formValues.monthlyDate = moment(invoiceData.fromDate);
                        break;
                    case PeriodType.RangeDate:
                        formValues.rangeDate = [
                            moment(invoiceData.fromDate),
                            moment(invoiceData.toDate),
                        ];
                        break;
                    case PeriodType.OneTime:
                        formValues.deliveryDate = moment(invoiceData.fromDate);
                        break;
                }

                form.setFieldsValue(formValues);
                setPeriodType(invoiceData.periodType);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const onFinish = async (values) => {
        if (values.items === undefined || values.items.length === 0) {
            message.error('Please add at least one item');
            return;
        }

        try {
            const formData = {
                id: parseInt(id),
                ...values,
                fromDate: null,
                toDate: null,
                notes: values.notes,
                items: values.items.map((item) => ({
                    itemDescription: item.description,
                    amount: item.amount,
                })),
            };

            switch (values.periodType) {
                case PeriodType.Monthly:
                    formData.fromDate = values.monthlyDate.toDate();
                    formData.toDate = values.monthlyDate.toDate();
                    break;
                case PeriodType.RangeDate:
                    formData.fromDate = values.rangeDate[0].toDate();
                    formData.toDate = values.rangeDate[1].toDate();
                    break;
                case PeriodType.OneTime:
                    formData.fromDate = values.deliveryDate.toDate();
                    formData.toDate = values.deliveryDate.toDate();
                    break;
            }
            const response = await axios.put('/InterInvoice/UpdateInvoice', formData);
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
            <Card title="Edit Inter Invoice" className="invoice-form-card">
                <Form form={form} layout="vertical" onFinish={onFinish} className="invoice-form">
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
                                                    name={[name, 'description']}
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
                                                            value.replace(/\$\s?|(,*)/g, '')
                                                        }
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={8} sm={8} md={4} lg={4} xl={3} xxl={2}>
                                                {fields.length > 1 && (
                                                    <MinusCircleOutlined
                                                        className="dynamic-delete-button"
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
                            </>
                        )}
                    </Form.List>

                    <Form.Item name="notes" label="Notes">
                        <TextArea rows={4} placeholder="Enter any additional notes" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Update Invoice
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AppContainer;
