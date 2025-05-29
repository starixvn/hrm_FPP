import * as React from 'react';
import { Modal, Timeline, Tag } from 'antd';
import CommonFunctions from '../common-functions';

const ActivityLogModal = ({ isVisible, onClose, activityLogs }) => {
    return (
        <Modal
            title="Activity Log"
            open={isVisible}
            onCancel={onClose}
            footer={null}
            width={800}
            bodyStyle={{
                maxHeight: 'calc(100vh - 200px)',
                overflow: 'auto',
                padding: '24px',
            }}
        >
            <Timeline
                items={[...activityLogs]
                    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
                    .map((log) => ({
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
                                                    <strong>{item.field}:</strong>{' '}
                                                    <span
                                                        style={{
                                                            textDecoration: 'line-through',
                                                            color: '#999',
                                                        }}
                                                    >
                                                        {item.oldValue || 'N/A'}
                                                    </span>
                                                    {' → '}
                                                    <span style={{ color: '#52c41a' }}>
                                                        {item.newValue || 'N/A'}
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
