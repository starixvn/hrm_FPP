import React, { useState, useEffect } from 'react';
import { Card, Button, message, Spin, Descriptions, Row, Col, Typography, Divider } from 'antd';
import axios from 'axios';
import { mapPeriodType, PeriodType } from '../../components/enum';
import moment from 'moment';

const { Title, Text } = Typography;

const AppContainer = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/InterInvoice/GetInvoice/${window.invoiceId}`);
                setInvoiceData(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch invoice data');
                setLoading(false);
            }
        };
        if (window.invoiceId) {
            fetchData();
        }
    }, [window.invoiceId]);

    const handleApprove = async () => {
        try {
            await axios.post(`/InterInvoice/ApproveInvoice/${invoiceId}`);
            message.success('Invoice approved successfully');
        } catch (error) {
            message.error(error.response?.data || 'Failed to approve invoice');
        }
    };

    const handleReject = async () => {
        try {
            await axios.post(`/InterInvoice/RejectInvoice/${invoiceId}`);
            message.success('Invoice rejected successfully');
        } catch (error) {
            message.error(error.response?.data || 'Failed to reject invoice');
        }
    };

    const formatDate = (date) => {
        return date ? moment(date).format('DD/MM/YYYY') : '-';
    };

    const formatCurrency = (amount) => {
        return amount ? amount.toLocaleString() : '0';
    };

    const renderPeriodTimeRange = () => {
        if (!invoiceData?.periodType === PeriodType.Monthly) {
            return;
        } else if (invoiceData?.periodType === PeriodType.RangeDate) {
            return (
                <div className="header-value">
                    {formatDate(invoiceData?.fromDate)} - {formatDate(invoiceData?.toDate)}
                </div>
            );
        } else if (invoiceData?.periodType === PeriodType.OneTime) {
            return <div className="header-value">{formatDate(invoiceData?.fromDate)}</div>;
        }
    };

    if (loading) {
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
    }

    if (error) {
        return (
            <div className="invoice-container">
                <Card className="invoice-form-card">
                    <div style={{ textAlign: 'center', padding: '50px 0', color: '#ff4d4f' }}>
                        <div style={{ fontSize: '16px' }}>{error}</div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="invoice-container">
            <div className="invoice-header-row">
                <div className="invoice-header-col">
                    <div className="header-label">
                        BILLER:{' '}
                        <span className="header-value">
                            {invoiceData?.billerGroupUnitId} - {invoiceData?.billerName}
                        </span>
                    </div>
                    <div className="header-label">
                        Creator: <span className="header-value">{invoiceData?.createdByName}</span>
                    </div>
                    <div className="header-label">
                        Created At:{' '}
                        <span className="header-value">{formatDate(invoiceData?.createdAt)}</span>
                    </div>
                </div>
                <div className="invoice-header-col">
                    <div className="header-label">
                        PAYER:{' '}
                        <span className="header-value">
                            {invoiceData?.payerGroupUnitId} - {invoiceData?.payerName}
                        </span>
                    </div>
                    <div className="header-label">
                        Handler: <span className="header-value">{invoiceData?.handlerName}</span>
                    </div>
                </div>
                <div className="invoice-header-col invoice-header-info">
                    <div className="header-label">
                        Billing Period:{' '}
                        <span className="header-value">
                            {mapPeriodType[invoiceData?.periodType]}
                        </span>
                    </div>
                    {renderPeriodTimeRange()}
                </div>
            </div>
            {invoiceData?.notes && (
                <div className="invoice-notes-section">
                    Notes: <span className="invoice-notes-value">{invoiceData?.notes}</span>
                </div>
            )}
            <div className="invoice-title">INVOICE #{invoiceData?.interInvoiceId}</div>
            <div className="invoice-table-wrapper">
                <div className="invoice-table-header">
                    <div className="col-desc">DESCRIPTION</div>
                    <div className="col-price">PRICE</div>
                </div>
                {invoiceData?.items?.map((item, idx) => (
                    <div className="invoice-table-row" key={idx}>
                        <div className="col-desc">{item.itemDescription}</div>
                        <div className="col-price">
                            {formatCurrency(item.amount)} {invoiceData?.currency}
                        </div>
                    </div>
                ))}
                <div className="invoice-table-footer">
                    <div className="col-desc subtotal-label">TOTAL AMOUNT</div>
                    <div className="col-price subtotal-value">
                        {formatCurrency(
                            invoiceData?.items?.reduce((sum, i) => sum + (i.amount || 0), 0)
                        )}{' '}
                        {invoiceData?.currency}
                    </div>
                </div>
            </div>
            {/* Action buttons row */}
            {invoiceData.isHandler && (
                <div className="invoice-action-row">
                    <Button type="primary" className="confirm-btn" onClick={handleApprove}>
                        Approve
                    </Button>
                    <Button danger onClick={handleReject}>
                        Reject
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AppContainer;
