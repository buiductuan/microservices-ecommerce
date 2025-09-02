import React, { useRef, useEffect } from 'react';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Tag, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchOrders, updateOrderStatus, Order } from '../../store/slices/orderSlice';

const Orders: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const dispatch = useDispatch<AppDispatch>();
  const { orders, isLoading, total } = useSelector((state: RootState) => state.order);

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleStatusChange = async (id: string, status: Order['status']) => {
    try {
      await dispatch(updateOrderStatus({ id, status })).unwrap();
      message.success('Order status updated successfully');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || 'Failed to update order status');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const columns: ProColumns<Order>[] = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      width: 200,
      render: (text) => <a>{text?.slice(0, 8)}</a>,
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      width: 200,
      render: (text) => text?.slice(0, 8),
    },
    {
      title: 'Items Count',
      dataIndex: 'items',
      render: (items) => items?.length || 0,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      valueType: 'money',
      sorter: true,
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
        confirmed: { text: 'Confirmed', status: 'Processing' },
        shipped: { text: 'Shipped', status: 'Success' },
        delivered: { text: 'Delivered', status: 'Success' },
        cancelled: { text: 'Cancelled', status: 'Error' },
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
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
        <Button
          key="confirm"
          type="link"
          onClick={() => handleStatusChange(record.id, 'confirmed')}
          disabled={record.status !== 'pending'}
        >
          Confirm
        </Button>,
        <Button
          key="ship"
          type="link"
          onClick={() => handleStatusChange(record.id, 'shipped')}
          disabled={record.status !== 'confirmed'}
        >
          Ship
        </Button>,
      ],
    },
  ];

  return (
    <ProTable<Order>
      headerTitle="Orders Management"
      actionRef={actionRef}
      rowKey="id"
      loading={isLoading}
      search={{
        labelWidth: 'auto',
      }}
      request={async (params = {}) => {
        await dispatch(fetchOrders({
          page: 1,
          limit: 10,
        }));

        return {
          data: orders,
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

export default Orders;
