import React from 'react';
import { Typography } from 'antd';
const { Title, Text } = Typography;

const AppContainer = () => {
    return (
        <div className="dashboard-container">
            <div className="welcome-section">
                <Title level={1} className="welcome-title">
                    WELCOME TO FMS
                </Title>
                <Text className="welcome-subtitle">
                    Financial Management System - Your comprehensive solution for finance management
                </Text>
                <img src="/images/dashboard.png" alt="Dashboard Overview" />
            </div>
        </div>
    );
};

export default AppContainer;
