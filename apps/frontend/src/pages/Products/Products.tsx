import React, { useRef, useEffect } from 'react';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchProducts, deleteProduct, Product } from '../../store/slices/productSlice';

const Products: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading, total } = useSelector((state: RootState) => state.product);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      message.success('Product deleted successfully');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || 'Failed to delete product');
    }
  };

  const columns: ProColumns<Product>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      valueType: 'money',
      sorter: true,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      sorter: true,
      render: (stock) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>
          {stock}
        </Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      valueType: 'select',
      valueEnum: {
        electronics: { text: 'Electronics', status: 'Success' },
        clothing: { text: 'Clothing', status: 'Processing' },
        books: { text: 'Books', status: 'Default' },
        home: { text: 'Home & Garden', status: 'Warning' },
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
          key="edit"
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            message.info('Edit functionality coming soon');
          }}
        >
          Edit
        </Button>,
        <Popconfirm
          key="delete"
          title="Are you sure you want to delete this product?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
          >
            Delete
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <ProTable<Product>
      headerTitle="Products Management"
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
            message.info('Create functionality coming soon');
          }}
        >
          Add Product
        </Button>,
      ]}
      request={async (params = {}) => {
        await dispatch(fetchProducts({
          page: 1,
          limit: 10,
        }));

        return {
          data: products,
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

export default Products;
