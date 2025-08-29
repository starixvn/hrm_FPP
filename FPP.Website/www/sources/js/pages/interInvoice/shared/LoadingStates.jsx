import React from 'react';
import { Card, Spin } from 'antd';

export const LoadingState = ({ message = 'Loading invoice data...' }) => (
    <div className="invoice-container">
        <Card className="invoice-form-card">
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: '20px', fontSize: '16px', color: '#666' }}>
                    <div className="loading-text">{message}</div>
                </div>
            </div>
        </Card>
    </div>
);

export const ErrorState = ({ error, message = 'An error occurred' }) => (
    <div className="invoice-container">
        <Card className="invoice-form-card">
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#ff4d4f' }}>
                <div style={{ fontSize: '16px' }}>{error || message}</div>
            </div>
        </Card>
    </div>
);
