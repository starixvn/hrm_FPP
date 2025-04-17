import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Select, Spin, ConfigProvider, Typography, Row, Col } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { Title } = Typography;

const AppContainer = () => {
  const [loading, setLoading] = useState(false);
  const [costExpenseData, setCostExpenseData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [year, setYear] = useState(2025);
  const [groupUnitId, setGroupUnitId] = useState(920);
  const [categoryId, setCategoryId] = useState(null);

  const fetchCostExpenseData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/Report/GetCostExpense`, {
        params: {
          groupUnitId,
          year,
          categoryId
        }
      });
      setCostExpenseData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const response = await axios.get(`/Report/GetCategory`);
      setCategoryData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (groupUnitId) {
      fetchCostExpenseData();
    }
  }, [groupUnitId, year, categoryId]);

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const months = useMemo(() => {
    if (costExpenseData.length > 0 && costExpenseData[0].monthlyTotalAmounts) {
      return Object.keys(costExpenseData[0].monthlyTotalAmounts);
    }
    return [];
  }, [costExpenseData]);

  const renderFilters = () => (
    <Row className="report-filters" gutter={[16, 16]}>
      <Col span={8}>
        <div className="filter-label">Group Unit</div>
        <Select placeholder="Select Group Unit" onChange={setGroupUnitId} value={groupUnitId}>
          <Option value={920}>920</Option>
        </Select>
      </Col>
      <Col span={8}>
        <div>
          <div className="filter-label">Year</div>
          <Select placeholder="Year" onChange={setYear} value={year}>
            <Option value="2024">2024</Option>
            <Option value="2025">2025</Option>
            <Option value="2026">2026</Option>
          </Select>
        </div>
      </Col>
      <Col span={8}>
        <div>
          <div className="filter-label">Category</div>
          <Select placeholder="Select Category" onChange={setCategoryId} value={categoryId} allowClear>
            {categoryData.map((category) => (
              <Option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </Option>
            ))}
          </Select>
        </div>
      </Col>
    </Row>
  );

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 120,
        render: (text, record) => {
          if (record.isCategory) {
            return <strong>{text}</strong>;
          } else if (record.isGrandTotal) {
            return <strong>{text}</strong>;
          } else {
            return <span>{text}</span>;
          }
        }
      }
    ];

    const monthColumns = months.map((month) => ({
      title: month,
      dataIndex: month,
      key: month,
      width: 60,
      align: 'right',
      render: (text, record) => {
        const value = text || '0';
        if (record.isCategory || record.isGrandTotal) {
          return <strong>{value}</strong>;
        }
        return value;
      }
    }));

    return [...baseColumns, ...monthColumns];
  }, [months]);

  const dataSource = useMemo(() => {
    if (!costExpenseData.length) return [];

    const flatData = [];

    costExpenseData.forEach((category, categoryIndex) => {
      if (category.details && category.details.length) {
        category.details.forEach((term, termIndex) => {
          const termRow = {
            key: `term_${category.categoryId}_${termIndex}`,
            name: term.termName,
            isCategory: false
          };

          months.forEach((month) => {
            termRow[month] = term.monthlyAmounts[month];
          });

          flatData.push(termRow);
        });
      }

      const categoryRow = {
        key: `category_${category.categoryId}`,
        name: category.categoryName,
        isCategory: true
      };

      months.forEach((month) => {
        categoryRow[month] = category.monthlyTotalAmounts[month];
      });

      flatData.push(categoryRow);
    });

    return flatData;
  }, [costExpenseData, months]);

  const calculateGrandTotals = () => {
    if (!costExpenseData.length) return null;

    const totalsRow = {
      key: 'grand_total',
      name: 'Grand Total',
      isGrandTotal: true
    };

    months.forEach((month) => {
      totalsRow[month] = costExpenseData.reduce((sum, category) => sum + (Number(category.monthlyTotalAmounts[month]) || 0), 0);
    });

    return totalsRow;
  };

  const tableData = useMemo(() => {
    return dataSource
      .filter((item) => !item.isSeparator)
      .concat(calculateGrandTotals())
      .filter(Boolean);
  }, [dataSource]);

  const getRowClassName = (record) => {
    if (record.isGrandTotal) {
      return 'grand-total-row';
    } else if (record.isCategory) {
      return 'category-row';
    }
    return '';
  };

  return (
    <div className="report-container">
      <ConfigProvider>
        <Card title={<Title level={4}>Cost Expense Report</Title>} className="report-card">
          {renderFilters()}

          <Spin spinning={loading}>
            <Table
              className="cost-expense-table"
              columns={columns}
              dataSource={tableData}
              pagination={false}
              scroll={{ x: 'max-content', y: 'calc(100vh - 240px)' }}
              bordered
              rowClassName={getRowClassName}
              onRow={(record) => {
                if (record?.isSeparator) {
                  return {
                    className: 'separator-row'
                  };
                }
                return {};
              }}
            />
          </Spin>
        </Card>
      </ConfigProvider>
    </div>
  );
};

export default AppContainer;
