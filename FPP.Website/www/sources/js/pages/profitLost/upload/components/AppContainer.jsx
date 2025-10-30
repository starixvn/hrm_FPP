import React, { useState } from 'react';
import UploadFile from '../../../common/components/UploadFile';
import ProfitLostUploadHistoryTable from './ProfitLostUploadHistoryTable';
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
                    <UploadFile
                        uploadEndpoint="/ProfitLost/UploadExcel"
                        onUploadSuccess={handleUploadSuccess}
                    />
                </Card>
            )}
            <Card className="history-card" style={{ marginTop: 24 }}>
                <Title level={2} className="page-title">
                    Upload History
                </Title>
                <ProfitLostUploadHistoryTable refetchData={refreshKey} />
            </Card>
        </div>
    );
};

export default AppContainer;
