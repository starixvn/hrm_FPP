import { Form, Select, DatePicker, Divider } from 'antd';
import { mapPeriodType, PeriodType } from '../helper/enum';
import React, { useState } from 'react';
import TextArea from 'antd/es/input/TextArea';

export const PeriodTypeFields = () => {
    const [periodType, setPeriodType] = useState(PeriodType.Monthly);
    return (
        <>
            <Divider>Billing Period</Divider>
            <Form.Item name="periodType" label="Billing Period" initialValue={PeriodType.Monthly}>
                <Select onChange={value => setPeriodType(value)}>
                    <Option value={PeriodType.Monthly}>{mapPeriodType[PeriodType.Monthly]}</Option>
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
        </>
    );
};
