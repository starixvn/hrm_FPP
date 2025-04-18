import React, { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import axios from "axios";

const UploadHistoryTable = ({ refetchData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "/api/BUCostAndExpense/GetUploadHistory"
      );
      setData(response.data);
    } catch (error) {
      message.error("Failed to fetch upload history");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (savedFileName, fileName) => {
    window.location.href = `/api/BUCostAndExpense/DownloadExcel?savedFileName=${savedFileName}&fileName=${fileName}`;
  };

  useEffect(() => {
    fetchData();
  }, [refetchData]);

  const columns = [
    {
      title: "BU ID",
      dataIndex: "buId",
      key: "buId",
      align: "center",
    },
    {
      title: "BU Code",
      dataIndex: "buCode",
      key: "buCode",
      align: "center",
    },
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
      align: "center",
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => handleDownload(record.savedFileName, record.fileName)}>
          {text}
        </Button>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      align: "center",
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      align: "center",
      render: (text) => new Date(text).toLocaleString(),
    },
  ];

  return (
    <Table
      className="custom-table"
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey={(record) => `${record.buId}-${record.createdDate}`}
      pagination={{ pageSize: 10 }}
      size="small"
      bordered
    />
  );
};

export default UploadHistoryTable;
