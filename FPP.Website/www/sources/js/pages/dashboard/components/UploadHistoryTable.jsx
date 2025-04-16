import React, { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import axios from "axios";

const UploadHistoryTable = () => {
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

  const handleDownload = async (savedFileName) => {
    try {
      const response = await axios.get(
        `/api/BUCostAndExpense/DownloadExcel?savedFileName=${savedFileName}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", savedFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error("Failed to download file");
      console.error("Error downloading file:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const columns = [
    {
      title: "BU ID",
      dataIndex: "buId",
      key: "buId",
    },
    {
      title: "BU Code",
      dataIndex: "buCode",
      key: "buCode",
    },
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => handleDownload(record.savedFileName)}>
          {text}
        </Button>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Created Date",
      dataIndex: "createTime",
      key: "createTime",
      render: (text) => new Date(text).toLocaleString(),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="SavedFileName"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default UploadHistoryTable;
