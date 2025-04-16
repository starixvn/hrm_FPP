import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Select, Space, Spin, ConfigProvider, Collapse, Typography, Row, Col } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { Panel } = Collapse;
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

  // Filter controls
  const renderFilters = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col span={8}>
        <div>
          <div style={{ marginBottom: 4 }}>Group Unit</div>
          <Select placeholder="Select Group Unit" style={{ width: '100%' }} onChange={setGroupUnitId} value={groupUnitId}>
            <Option value={920}>920</Option>
          </Select>
        </div>
      </Col>
      <Col span={8}>
        <div>
          <div style={{ marginBottom: 4 }}>Year</div>
          <Select placeholder="Year" style={{ width: '100%' }} onChange={setYear} value={year}>
            <Option value="2024">2024</Option>
            <Option value="2025">2025</Option>
            <Option value="2026">2026</Option>
          </Select>
        </div>
      </Col>
      <Col span={8}>
        <div>
          <div style={{ marginBottom: 4 }}>Category</div>
          <Select placeholder="Select Category" style={{ width: '100%' }} onChange={setCategoryId} value={categoryId} allowClear>
            {categoryData.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </div>
      </Col>
    </Row>
  );

  // Desktop view for monthly data
  const renderDetails = (details, monthlyTotalAmounts) => {
    return (
      <div style={{ padding: '0 8px', overflowX: 'auto' }}>
        {details.map((detail, index) => (
          <div key={index} style={{ marginBottom: '8px', padding: '4px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ minWidth: '150px', flex: '0 0 auto' }}>{detail.termName}</span>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'nowrap' }}>
                {months.map((month) => (
                  <span key={month} style={{ width: '60px', textAlign: 'right', flex: '0 0 auto' }}>
                    {detail.monthlyAmounts[month]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div style={{ padding: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', minWidth: '150px', flex: '0 0 auto' }}>Total</span>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'nowrap' }}>
              {months.map((month) => (
                <span key={month} style={{ width: '60px', textAlign: 'right', fontWeight: 600, flex: '0 0 auto' }}>
                  {monthlyTotalAmounts[month]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Panel header
  const renderPanelHeader = (item) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', overflowX: 'auto' }}>
        <span style={{ fontWeight: 'bold', minWidth: '150px', flex: '0 0 auto' }}>{item.categoryName}</span>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'nowrap' }}>
          {months.map((month) => (
            <span key={month} style={{ width: '60px', textAlign: 'right', flex: '0 0 auto' }}>
              {month}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="report-container">
      <ConfigProvider>
        <Card title={<Title level={4}>Cost Expense Report</Title>} className="report-card" bodyStyle={{ padding: 24 }}>
          {renderFilters()}

          <Spin spinning={loading}>
            <div style={{ overflowX: 'auto' }}>
              <Collapse defaultActiveKey={costExpenseData.map((item) => item.categoryId)}>
                {costExpenseData.map((item) => (
                  <Panel key={item.categoryId} header={renderPanelHeader(item)}>
                    {renderDetails(item.details, item.monthlyTotalAmounts)}
                  </Panel>
                ))}
              </Collapse>
            </div>
          </Spin>
        </Card>
      </ConfigProvider>
    </div>
  );
};

export default AppContainer;
