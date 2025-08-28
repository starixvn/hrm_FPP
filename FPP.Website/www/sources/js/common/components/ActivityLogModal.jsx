import * as React from 'react';
import { Modal, Timeline, Tag } from 'antd';
import CommonFunctions from '../common-functions';

const formatValue = value => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return value
                .map(item => {
                    if (typeof item === 'object') {
                        return Object.entries(item)
                            .map(([key, val]) => `${key}: ${val}`)
                            .join(', ');
                    }
                    return item;
                })
                .join('; ');
        }
        return Object.entries(value)
            .map(([key, val]) => `${key}: ${val}`)
            .join(', ');
    }
    return value.toString();
};

const ActivityLogModal = ({ isVisible, onClose, activityLogs }) => {
    return (
        <Modal
            title="Activity Log"
            open={isVisible}
            onCancel={onClose}
            footer={null}
            width={800}
            styles={{
                body: {
                    maxHeight: 'calc(100vh - 200px)',
                    overflow: 'auto',
                    padding: '24px',
                },
            }}
        >
            <Timeline
                items={[...activityLogs]
                    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
                    .filter(log => log.changedItems && log.changedItems.length > 0)
                    .map(log => ({
                        children: (
                            <div>
                                <div>
                                    <Tag color="blue">{log.objectTypeName}</Tag>
                                    <Tag color="green">{log.actionTypeName}</Tag>
                                </div>
                                <div style={{ marginTop: '8px' }}>
                                    <strong>By:</strong> {log.createdByName} at{' '}
                                    {CommonFunctions.formatDateTime(log.createdDate)}
                                </div>
                                {log.changedItems && log.changedItems.length > 0 && (
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                            Changes:
                                        </div>
                                        {log.changedItems.map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    marginLeft: '16px',
                                                    marginBottom: '4px',
                                                }}
                                            >
                                                <div>
                                                    <span>{item.field}:</span>{' '}
                                                    <span
                                                        style={{
                                                            textDecoration: 'line-through',
                                                            color: '#999',
                                                        }}
                                                    >
                                                        {formatValue(item.oldValue)}
                                                    </span>
                                                    {' → '}
                                                    <span style={{ color: '#52c41a' }}>
                                                        {formatValue(item.newValue)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ),
                    }))}
            />
        </Modal>
    );
};

export default ActivityLogModal;
