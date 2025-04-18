import React from 'react';
import { Typography } from 'antd';
const { Title, Text } = Typography;

const AppContainer = () => {
    return (
        <div className="dashboard-container">
            <div className="welcome-section">
                <Title level={1} className="welcome-title">
                    Welcome to FMS
                </Title>
                <Text className="welcome-subtitle">
                    Financial Management System - Your comprehensive solution for cost and expense
                    management
                </Text>
            </div>
        </div>
    );
};

export default AppContainer;
