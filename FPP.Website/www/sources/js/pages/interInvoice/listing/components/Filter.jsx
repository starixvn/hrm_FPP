import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Select, message } from 'antd';
import { fetchBuList } from '../helper/service';

const { Option } = Select;

const Filter = ({ onFilter }) => {
    const [buList, setBuList] = useState([]);
    const [form] = Form.useForm();

    const loadBuList = async () => {
        const data = await fetchBuList();
        setBuList(data);
    };

    useEffect(() => {
        loadBuList();
    }, []);

    const handleFilter = (values) => {
        const params = {
            billerUnitId: values.billerUnitId === 'all' ? undefined : values.billerUnitId,
            payerUnitId: values.payerUnitId === 'all' ? undefined : values.payerUnitId,
        };
        onFilter(params);
    };

    return (
        <Form form={form} onFinish={handleFilter} layout="vertical">
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="billerUnitId" label="Biller" initialValue="all">
                        <Select
                            placeholder="Select Biller"
                            onChange={(value) =>
                                handleFilter({
                                    ...form.getFieldsValue(),
                                    billerUnitId: value,
                                })
                            }
                        >
                            <Option value="all">All</Option>
                            {buList.map((bu) => (
                                <Option key={bu.groupUnitId} value={bu.unitId}>
                                    {bu.groupUnitId} - {bu.code}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="payerUnitId" label="Payer" initialValue="all">
                        <Select
                            placeholder="Select Payer"
                            onChange={(value) =>
                                handleFilter({
                                    ...form.getFieldsValue(),
                                    payerUnitId: value,
                                })
                            }
                        >
                            <Option value="all">All</Option>
                            {buList.map((bu) => (
                                <Option key={bu.groupUnitId} value={bu.unitId}>
                                    {bu.groupUnitId} - {bu.code}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
};

export default Filter;
