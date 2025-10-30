import React, { useState } from 'react';
import UploadPLFile from './UploadPLFile';
import UploadHistoryTable from './UploadHistoryTable';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const AppContainer = ({ isHost }) => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div>
            {isHost && (
                <Card className="upload-card">
                    <Title level={2} className="page-title">
                        BU P&L Upload
                    </Title>
                    <UploadPLFile onUploadSuccess={handleUploadSuccess} />
                </Card>
            )}
            <Card className="history-card" style={{ marginTop: 24 }}>
                <Title level={2} className="page-title">
                    Upload History
                </Title>
                <UploadHistoryTable refetchData={refreshKey} />
            </Card>
        </div>
    );
};

export default AppContainer;
