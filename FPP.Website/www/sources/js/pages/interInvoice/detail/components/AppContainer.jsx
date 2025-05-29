import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, message, Spin, Modal, Tag, Input } from 'antd';
import axios from 'axios';
import {
    mapPeriodType,
    PeriodType,
    InterInvoiceStatus,
    mapInterInvoiceStatus,
    mapIconStatus,
    mapColorStatus,
} from '../../components/enum';
import CommonFunctions from '../../../../common/common-functions';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ActivityLogModal from '../../../../common/components/ActivityLogModal';
import PageContainer from '../../../common/components/PageContainer';

const AppContainer = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [isActivityLogVisible, setIsActivityLogVisible] = useState(false);
    const [activityLogs, setActivityLogs] = useState([]);
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

    const fetchActivityLogs = async () => {
        try {
            const response = await axios.get(`/InterInvoice/GetActivityLog/${window.invoiceId}`);
            setActivityLogs(response.data);
        } catch (error) {
            message.error('Failed to fetch activity logs');
        }
    };

    const handleShowActivityLog = () => {
        setIsActivityLogVisible(true);
        fetchActivityLogs();
    };

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

    const handleBack = () => {
        window.location.href = '/interInvoice/index';
    };

    const renderPeriodTimeRange = () => {
        if (invoiceData?.periodType === PeriodType.Monthly) {
            return (
                <span className="header-value">
                    - {CommonFunctions.formatMonth(invoiceData?.fromDate)}
                </span>
            );
        } else if (invoiceData?.periodType === PeriodType.RangeDate) {
            return (
                <span className="header-value">
                    - {CommonFunctions.formatDate(invoiceData?.fromDate)} -{' '}
                    {CommonFunctions.formatDate(invoiceData?.toDate)}
                </span>
            );
        } else if (invoiceData?.periodType === PeriodType.OneTime) {
            return (
                <span className="header-value">
                    - {CommonFunctions.formatDate(invoiceData?.fromDate)}
                </span>
            );
        }
    };

    const renderIsEditingButton = () => {
        return (
            <Button type="primary" className="editing-btn" disabled={!invoiceData.isCanEdit}>
                <ExclamationCircleOutlined />
                Invoice Adjusting by {invoiceData.editedByName}
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

    const renderActivityLogModal = () => {
        return (
            <ActivityLogModal
                isVisible={isActivityLogVisible}
                onClose={() => setIsActivityLogVisible(false)}
                activityLogs={activityLogs}
            />
        );
    };

    const renderActionButtons = () => {
        if (invoiceData.status != InterInvoiceStatus.Pending) {
            return;
            // return <Button onClick={handleShowActivityLog}>View Activity Log</Button>;
        } else if (invoiceData.isEditing) {
            return renderIsEditingButton();
        } else if (invoiceData.isCanConfirmReject || invoiceData.isCanEdit) {
            return (
                <>
                    {renderOthersButtons()}
                    {/* <Button onClick={handleShowActivityLog}>View Activity Log</Button> */}
                </>
            );
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '20px', fontSize: '16px', color: '#666' }}>
                        Loading invoice data...
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div style={{ textAlign: 'center', padding: '50px 0', color: '#ff4d4f' }}>
                    <div style={{ fontSize: '16px' }}>{error}</div>
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
                            Billing Period:{' '}
                            <span className="header-value">
                                {mapPeriodType[invoiceData?.periodType]} {renderPeriodTimeRange()}
                            </span>
                        </div>
                        <div className="header-label">
                            Handler:{' '}
                            <span className="header-value">{invoiceData?.handlerName}</span>
                        </div>
                        <div className="header-label">
                            Creator:{' '}
                            <span className="header-value">
                                {invoiceData?.createdByName} -{' '}
                                {CommonFunctions.formatDateTime(invoiceData?.createdAt)}
                            </span>
                        </div>
                        {invoiceData?.modifiedBy && (
                            <div className="header-label">
                                Modifier:{' '}
                                <span className="header-value">
                                    {invoiceData?.modifiedBy} - {invoiceData?.modifiedAt}
                                </span>
                            </div>
                        )}
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
                        {invoiceData?.updateStatusByName && (
                            <>
                                <div className="header-label">
                                    {mapInterInvoiceStatus[invoiceData?.status]}
                                    {' by: '}
                                    <span className="header-value">
                                        {invoiceData?.updateStatusByName}
                                    </span>
                                </div>
                                <div className="header-label">
                                    {mapInterInvoiceStatus[invoiceData?.status]}
                                    {' at: '}
                                    <span className="header-value">
                                        {CommonFunctions.formatDateTime(
                                            invoiceData?.updateStatusAt
                                        )}
                                    </span>
                                </div>
                            </>
                        )}
                        {invoiceData?.status === InterInvoiceStatus.Rejected &&
                            invoiceData?.rejectionReason && (
                                <div className="header-label">
                                    Reason:{' '}
                                    <span className="header-value">
                                        {invoiceData?.rejectionReason}
                                    </span>
                                </div>
                            )}
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
                        <div className="col-price">AMOUNT</div>
                    </div>
                    {invoiceData?.items?.map((item, idx) => (
                        <div className="invoice-table-row" key={idx}>
                            <div className="col-desc">{item.itemDescription}</div>
                            <div className="col-price">
                                {CommonFunctions.formatCurrency(item.amount)}{' '}
                                {invoiceData?.currency}
                            </div>
                        </div>
                    ))}
                    <div className="invoice-table-footer">
                        <div className="col-desc subtotal-label">TOTAL AMOUNT</div>
                        <div className="col-price subtotal-value">
                            {CommonFunctions.formatCurrency(
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

    return (
        <PageContainer
            title="Inter Invoice"
            subTitle="Detail"
            onTitleClick={handleBack}
            className="listing-invoice-container"
        >
            {renderContent()}
            {renderActivityLogModal()}
        </PageContainer>
    );
};

export default AppContainer;
