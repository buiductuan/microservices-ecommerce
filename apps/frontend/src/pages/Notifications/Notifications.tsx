import React, { useRef, useEffect } from 'react';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Tag, Space } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchNotifications, sendNotification, Notification } from '../../store/slices/notificationSlice';

const Notifications: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, isLoading, total } = useSelector((state: RootState) => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
  }, [dispatch]);

  const getStatusColor = (status: Notification['status']) => {
    const colors = {
      pending: 'orange',
      sent: 'green',
      failed: 'red',
    };
    return colors[status] || 'default';
  };

  const getTypeColor = (type: Notification['type']) => {
    const colors = {
      email: 'blue',
      sms: 'purple',
      push: 'cyan',
    };
    return colors[type] || 'default';
  };

  const columns: ProColumns<Notification>[] = [
    {
      title: 'Title',
      dataIndex: 'title',
      ellipsis: true,
      width: 200,
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {type?.toUpperCase()}
        </Tag>
      ),
      valueType: 'select',
      valueEnum: {
        email: { text: 'Email', status: 'Processing' },
        sms: { text: 'SMS', status: 'Success' },
        push: { text: 'Push', status: 'Warning' },
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      ),
      valueType: 'select',
      valueEnum: {
        pending: { text: 'Pending', status: 'Warning' },
        sent: { text: 'Sent', status: 'Success' },
        failed: { text: 'Failed', status: 'Error' },
      },
    },
    {
      title: 'Recipient',
      dataIndex: 'recipientId',
      width: 150,
      render: (text) => text?.slice(0, 8),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: 'Sent At',
      dataIndex: 'sentAt',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: 'Actions',
      valueType: 'option',
      key: 'option',
      render: (text, record) => [
        <Button
          key="view"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            message.info('View details functionality coming soon');
          }}
        >
          View
        </Button>,
      ],
    },
  ];

  return (
    <ProTable<Notification>
      headerTitle="Notifications Management"
      actionRef={actionRef}
      rowKey="id"
      loading={isLoading}
      search={{
        labelWidth: 'auto',
      }}
      toolBarRender={() => [
        <Button
          key="button"
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => {
            message.info('Send notification functionality coming soon');
          }}
        >
          Send Notification
        </Button>,
      ]}
      request={async (params = {}) => {
        await dispatch(fetchNotifications({
          page: 1,
          limit: 10,
        }));

        return {
          data: notifications,
          success: true,
          total: total,
        };
      }}
      columns={columns}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
      }}
    />
  );
};

export default Notifications;
