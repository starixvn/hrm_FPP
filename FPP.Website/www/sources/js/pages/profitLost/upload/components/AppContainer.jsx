import React, { useState } from 'react';
import UploadFile from '../../../common/components/UploadFile';
import ProfitLostUploadHistoryTable from './ProfitLostUploadHistoryTable';
import { Card, Typography, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

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
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                        }}
                    >
                        <Title level={2} className="page-title" style={{ margin: 0 }}>
                            BU P&L Upload
                        </Title>
                        <Button
                            className="btn-download"
                            type="default"
                            icon={<DownloadOutlined />}
                            onClick={() => {
                                window.location.href = '/ProfitLost/DownloadTemplate';
                            }}
                        >
                            Download Template
                        </Button>
                    </div>
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
