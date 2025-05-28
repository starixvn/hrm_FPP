import React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';

export const PeriodType = {
    Monthly: 0,
    RangeDate: 1,
    OneTime: 2,
};

export const InterInvoiceStatus = {
    ConfirmPending: 0,
    Confirmed: 1,
    Rejected: 2,
};

export const mapPeriodType = {
    [PeriodType.Monthly]: 'Monthly',
    [PeriodType.RangeDate]: 'Range Date',
    [PeriodType.OneTime]: 'One Time',
};

export const mapInterInvoiceStatus = {
    [InterInvoiceStatus.ConfirmPending]: 'Confirm Pending',
    [InterInvoiceStatus.Confirmed]: 'Confirmed',
    [InterInvoiceStatus.Rejected]: 'Rejected',
};

export const mapColorStatus = {
    [InterInvoiceStatus.ConfirmPending]: 'processing',
    [InterInvoiceStatus.Confirmed]: 'success',
    [InterInvoiceStatus.Rejected]: 'error',
};

export const mapIconStatus = {
    [InterInvoiceStatus.ConfirmPending]: <SyncOutlined />,
    [InterInvoiceStatus.Confirmed]: <CheckCircleOutlined />,
    [InterInvoiceStatus.Rejected]: <CloseCircleOutlined />,
};
