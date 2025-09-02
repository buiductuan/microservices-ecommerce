import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  useEffect(() => {
    // Fetch dashboard data
  }, []);

  const statsData = [
    {
      title: 'Total Users',
      value: 1234,
      icon: <UserOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      title: 'Total Products',
      value: 567,
      icon: <ShoppingOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
    },
    {
      title: 'Total Orders',
      value: 890,
      icon: <ShoppingCartOutlined style={{ color: '#faad14' }} />,
      color: '#faad14',
    },
    {
      title: 'Revenue',
      value: 45678,
      prefix: '$',
      icon: <DollarOutlined style={{ color: '#f5222d' }} />,
      color: '#f5222d',
    },
  ];

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]}>
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              style={{
                textAlign: 'center',
                borderLeft: `4px solid ${stat.color}`,
              }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                valueStyle={{ color: stat.color }}
              />
              <div style={{ fontSize: 24, marginTop: 8 }}>
                {stat.icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Recent Orders" style={{ height: 400 }}>
            <p>Recent orders will be displayed here...</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sales Chart" style={{ height: 400 }}>
            <p>Sales chart will be displayed here...</p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Recent Activities" style={{ height: 300 }}>
            <p>Recent activities will be displayed here...</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
