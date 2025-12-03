import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Button, Tooltip } from 'antd';
import { fetchInvoices } from '../../helper/service';
import Filter from './Filter';
import { mapInterInvoiceStatus, mapPeriodType } from '../../helper/enum';
import { EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import CommonFunctions from '../../../../common/common-functions';
import { formatPeriod, formatAmount } from '../../helper/format';
import DateTimeService from '../../../../common/dateTimeService';
import dayjs from 'dayjs';

const { Title } = Typography;

const AppContainer = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const isHost = document.getElementById('app-container').dataset.isHost === 'True';

    const getParamsFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        const billerUnitId = params.get('billerUnitId');
        const payerUnitId = params.get('payerUnitId');
        const month = params.get('month');

        return {
            billerUnitId: billerUnitId ? Number(billerUnitId) : undefined,
            payerUnitId: payerUnitId ? Number(payerUnitId) : undefined,
            month: month ? dayjs(month, 'YYYY-MM') : DateTimeService.getPreviousMonth(),
        };
    };

    const [filterParams, setFilterParams] = useState(() => getParamsFromURL());

    const updateURL = params => {
        const urlParams = new URLSearchParams();

        if (params.billerUnitId) {
            urlParams.set('billerUnitId', params.billerUnitId);
        }
        if (params.payerUnitId) {
            urlParams.set('payerUnitId', params.payerUnitId);
        }
        if (params.month) {
            const monthStr = params.month.format ? params.month.format('YYYY-MM') : params.month;
            urlParams.set('month', monthStr);
        }

        const newURL = `${window.location.pathname}${
            urlParams.toString() ? '?' + urlParams.toString() : ''
        }`;
        window.history.pushState({}, '', newURL);
    };

    const loadInvoices = async (params = {}) => {
        setLoading(true);
        const apiParams = {};
        if (params.billerUnitId !== undefined) {
            apiParams.billerUnitId = params.billerUnitId;
        }
        if (params.payerUnitId !== undefined) {
            apiParams.payerUnitId = params.payerUnitId;
        }
        apiParams.month = params.month
            ? params.month.format('YYYY-MM')
            : DateTimeService.getPreviousMonth();
        const data = await fetchInvoices(apiParams);
        setInvoices(data);
        setLoading(false);
    };

    const handleFilter = params => {
        const filterParams = {
            billerUnitId: params.billerUnitId,
            payerUnitId: params.payerUnitId,
            month: params.month || DateTimeService.getPreviousMonth(),
        };

        updateURL(filterParams);
        loadInvoices(filterParams);

        setFilterParams({
            billerUnitId: params.billerUnitId,
            payerUnitId: params.payerUnitId,
            month: params.month || DateTimeService.getPreviousMonth(),
        });
    };

    useEffect(() => {
        const initialParams = getParamsFromURL();
        setFilterParams(initialParams);
        loadInvoices(initialParams);

        const handlePopState = () => {
            const urlParams = getParamsFromURL();
            setFilterParams(urlParams);
            loadInvoices(urlParams);
        };

        // This ensures data is reloaded when page is restored from browser cache
        const handlePageShow = event => {
            if (event.persisted) {
                const urlParams = getParamsFromURL();
                setFilterParams(urlParams);
                loadInvoices(urlParams);
            }
        };

        window.addEventListener('popstate', handlePopState);
        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    const handleView = id => {
        window.location.href = `/interInvoice/detail/${id}`;
    };

    const handleExportExcel = (params = {}) => {
        params.month = params.month
            ? params.month.format('YYYY-MM')
            : DateTimeService.getPreviousMonth().format('YYYY-MM');
        window.location.href = `/InterInvoice/ExportInterInvoice?${new URLSearchParams(
            params
        ).toString()}`;
    };

    const columns = [
        {
            title: 'Invoice ID',
            dataIndex: 'interInvoiceId',
            key: 'interInvoiceId',
            sorter: (a, b) => a.interInvoiceId - b.interInvoiceId,
            defaultSortOrder: 'descend',
            align: 'left',
            width: '6%',
        },
        {
            title: 'Biller',
            dataIndex: 'billerUnitCode',
            key: 'billerUnitCode',
            sorter: (a, b) => a.billerUnitCode.localeCompare(b.billerUnitCode),
            align: 'left',
            width: '7%',
        },
        {
            title: 'Receiver',
            dataIndex: 'payerUnitCode',
            key: 'payerUnitCode',
            sorter: (a, b) => a.payerUnitCode.localeCompare(b.payerUnitCode),
            align: 'left',
            width: '7%',
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            sorter: (a, b) => a.totalAmount - b.totalAmount,
            render: amount => formatAmount(amount),
            align: 'right',
            width: '11%',
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            align: 'left',
            width: '5%',
        },
        {
            title: 'Handler',
            dataIndex: 'handler',
            key: 'handler',
            sorter: (a, b) => a.handler.localeCompare(b.handler),
            align: 'left',
            width: '10%',
        },
        {
            title: 'Period Type',
            dataIndex: 'periodType',
            key: 'periodType',
            sorter: (a, b) => a.periodType - b.periodType,
            render: periodType => mapPeriodType[periodType] || periodType,
            align: 'left',
            width: '8%',
        },
        {
            title: 'Period',
            dataIndex: 'fromDate',
            key: 'period',
            sorter: (a, b) => new Date(a.fromDate) - new Date(b.fromDate),
            render: (_, record) => formatPeriod(record.periodType, record.fromDate, record.toDate),
            align: 'left',
            width: '12%',
        },
        {
            title: 'Created Date',
            dataIndex: 'createdDate',
            key: 'createdDate',
            sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
            render: date => CommonFunctions.formatDateTime(date),
            align: 'left',
            width: '12%',
        },
        {
            title: 'Created By',
            dataIndex: 'createdBy',
            key: 'createdBy',
            sorter: (a, b) => a.createdBy.localeCompare(b.createdBy),
            align: 'left',
            width: '10%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status - b.status,
            render: (status, record) => {
                const statusText = mapInterInvoiceStatus[status] || status;
                const hasReason = record.rejectionReason && record.rejectionReason.trim();

                return (
                    <div className="status-with-reason">
                        <span className={`status-${statusText.toLowerCase()}`}>{statusText}</span>
                        {hasReason && (
                            <Tooltip title={record.rejectionReason} placement="top">
                                <ExclamationCircleOutlined className="reason-icon" />
                            </Tooltip>
                        )}
                    </div>
                );
            },
            align: 'left',
            width: '8%',
        },
        {
            title: '',
            key: 'view',
            align: 'center',
            width: '3%',
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EyeOutlined style={{ color: '#5273a5' }} />}
                    onClick={() => handleView(record.interInvoiceId)}
                />
            ),
        },
    ];

    return (
        <div className="listing-invoice-container">
            <Card title={<Title level={4}>Inter Invoice</Title>} className="report-card">
                <Filter
                    onFilter={handleFilter}
                    onExportExcel={handleExportExcel}
                    isHost={isHost}
                    initialValues={filterParams}
                />
                <Table
                    columns={columns}
                    dataSource={invoices}
                    loading={loading}
                    rowKey="interInvoiceId"
                    pagination={false}
                    size="small"
                    scroll={{ x: 'max-content', y: 'calc(100vh - 375px)' }}
                    bordered
                />
            </Card>
        </div>
    );
};

export default AppContainer;
