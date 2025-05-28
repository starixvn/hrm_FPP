import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, Button, message, Spin, Typography, Modal, Tag, Input } from 'antd';
import axios from 'axios';
import {
    mapPeriodType,
    PeriodType,
    InterInvoiceStatus,
    mapInterInvoiceStatus,
    mapIconStatus,
    mapColorStatus,
} from '../../components/enum';
import moment from 'moment';

const AppContainer = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `/InterInvoice/GetInvoice/${window.invoiceId}?isEdit=false`
                );
                if (response.data.interInvoiceId === 0) {
                    window.location.href = `/Error/AccessDenied`;
                }
                setInvoiceData(response.data);
                setLoading(false);
            } catch (err) {
                setError(error.response?.data || 'Failed to fetch invoice data');
                setLoading(false);
            }
        };
        if (window.invoiceId) {
            fetchData();
        }
    }, [window.invoiceId]);

    const handleApprove = async () => {
        try {
            await axios.put(`/InterInvoice/UpdateStatus`, {
                interInvoiceId: invoiceId,
                status: InterInvoiceStatus.Confirmed,
            });
            message.success('Invoice approved successfully');
            setIsApproveModalVisible(false);
            window.location.reload();
        } catch (error) {
            message.error(error.response?.data || 'Failed to approve invoice');
        }
    };

    const handleReject = async () => {
        try {
            await axios.put(`/InterInvoice/UpdateStatus`, {
                interInvoiceId: invoiceId,
                status: InterInvoiceStatus.Rejected,
                rejectionReason: rejectionReason,
            });
            message.success('Invoice rejected successfully');
            setIsRejectModalVisible(false);
            setRejectionReason('');
            window.location.reload();
        } catch (error) {
            message.error(error.response?.data || 'Failed to reject invoice');
        }
    };

    const handleEdit = () => {
        window.location.href = `/interInvoice/edit?id=${invoiceData.interInvoiceId}`;
        setIsEditModalVisible(false);
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

    const renderIsEditingButton = () => {
        return (
            <Button type="primary" className="confirm-btn" disabled={!invoiceData.isCanEdit}>
                Invoice Adjusting by {invoiceData.editingBy}
            </Button>
        );
    };

    const renderOthersButtons = () => {
        return (
            <>
                {invoiceData.isCanEdit && (
                    <>
                        <Button
                            type="primary"
                            className="confirm-btn"
                            onClick={() => setIsEditModalVisible(true)}
                        >
                            Edit
                        </Button>
                        <Modal
                            title="Confirm Edit"
                            open={isEditModalVisible}
                            onOk={handleEdit}
                            onCancel={() => setIsEditModalVisible(false)}
                            okText="Yes, Edit"
                            cancelText="Cancel"
                            okButtonProps={{ className: 'bg-dark' }}
                        >
                            <p>Are you sure you want to edit this invoice?</p>
                        </Modal>
                    </>
                )}
                {invoiceData.isCanConfirmReject && (
                    <>
                        <Button
                            type="primary"
                            className="confirm-btn"
                            onClick={() => setIsApproveModalVisible(true)}
                        >
                            Approve
                        </Button>
                        <Modal
                            title="Confirm Approval"
                            open={isApproveModalVisible}
                            onOk={handleApprove}
                            onCancel={() => setIsApproveModalVisible(false)}
                            okText="Yes, Approve"
                            cancelText="Cancel"
                            okButtonProps={{ className: 'bg-dark' }}
                        >
                            <p>Are you sure you want to approve this invoice?</p>
                        </Modal>
                        <Button danger onClick={() => setIsRejectModalVisible(true)}>
                            Reject
                        </Button>
                        <Modal
                            title="Confirm Rejection"
                            open={isRejectModalVisible}
                            onOk={handleReject}
                            onCancel={() => {
                                setIsRejectModalVisible(false);
                                setRejectionReason('');
                            }}
                            okText="Yes, Reject"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                        >
                            <p>Are you sure you want to reject this invoice?</p>
                            <Input.TextArea
                                placeholder="Please enter rejection reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                                style={{ marginTop: '16px' }}
                            />
                        </Modal>
                    </>
                )}
            </>
        );
    };

    const renderActionButtons = () => {
        if (invoiceData.status != InterInvoiceStatus.ConfirmPending) {
            return;
        } else if (invoiceData.isEditing) {
            return renderIsEditingButton();
        } else if (invoiceData.isCanConfirmReject || invoiceData.isCanEdit) {
            return renderOthersButtons();
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
                        PAYER:{' '}
                        <span className="header-value">
                            {invoiceData?.payerGroupUnitId} - {invoiceData?.payerName}
                        </span>
                    </div>
                    <div className="header-label">
                        Handler: <span className="header-value">{invoiceData?.handlerName}</span>
                    </div>
                    <div className="header-label">
                        Creator: <span className="header-value">{invoiceData?.createdByName}</span>
                    </div>
                    <div className="header-label">
                        Created At:{' '}
                        <span className="header-value">{formatDate(invoiceData?.createdAt)}</span>
                    </div>
                </div>
                <div className="invoice-header-col invoice-header-info">
                    <div className="header-label">
                        <Tag
                            className="status-tag"
                            icon={mapIconStatus[invoiceData?.status]}
                            color={mapColorStatus[invoiceData?.status]}
                        >
                            {mapInterInvoiceStatus[invoiceData?.status]}
                        </Tag>
                    </div>
                    {invoiceData?.status === InterInvoiceStatus.Rejected &&
                        invoiceData?.rejectionReason && (
                            <div className="header-label">
                                Reason:{' '}
                                <span className="header-value">{invoiceData?.rejectionReason}</span>
                            </div>
                        )}
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
            <div className="invoice-action-row">{renderActionButtons()}</div>
        </div>
    );
};

export default AppContainer;
