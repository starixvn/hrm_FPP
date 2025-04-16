import React from "react";
import UploadCostFile from "./UploadCostFile";
import UploadHistoryTable from "./UploadHistoryTable";
import { Card, Typography } from "antd";

const { Title } = Typography;

const AppContainer = () => {
  return (
    <div>
      <Card className="upload-card">
        <Title level={2} className="page-title">
          Upload BU Cost and Expense
        </Title>
        <UploadCostFile />
      </Card>
      <Card className="history-card" style={{ marginTop: 24 }}>
        <Title level={2} className="page-title">
          Upload History
        </Title>
        <UploadHistoryTable />
      </Card>
    </div>
  );
};

export default AppContainer;
