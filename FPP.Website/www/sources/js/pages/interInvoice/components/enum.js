import React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import moment from 'moment';

export const PeriodType = {
    Monthly: 0,
    RangeDate: 1,
    OneTime: 2,
};

export const InterInvoiceStatus = {
    Pending: 0,
    Confirmed: 1,
    Rejected: 2,
};

export const mapPeriodType = {
    [PeriodType.Monthly]: 'Monthly',
    [PeriodType.RangeDate]: 'Range Date',
    [PeriodType.OneTime]: 'One Time',
};

export const mapInterInvoiceStatus = {
    [InterInvoiceStatus.Pending]: 'Pending',
    [InterInvoiceStatus.Confirmed]: 'Confirmed',
    [InterInvoiceStatus.Rejected]: 'Rejected',
};

export const mapColorStatus = {
    [InterInvoiceStatus.Pending]: 'processing',
    [InterInvoiceStatus.Confirmed]: 'success',
    [InterInvoiceStatus.Rejected]: 'error',
};

export const mapIconStatus = {
    [InterInvoiceStatus.Pending]: <SyncOutlined />,
    [InterInvoiceStatus.Confirmed]: <CheckCircleOutlined />,
    [InterInvoiceStatus.Rejected]: <CloseCircleOutlined />,
};

export const formatCurrency = (amount) => {
    return amount ? amount.toLocaleString() : '0';
};

export const formatDate = (date) => {
    return date ? moment(date).format('DD/MM/YYYY') : '-';
};

export const formatDateTime = (date) => {
    return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
};
