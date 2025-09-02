import React, { useRef, useEffect, useState } from 'react';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchUsers, deleteUser, createUser, updateUser, User } from '../../store/slices/userSlice';
import UserFormModal from './UserFormModal';

const Users: React.FC = () => {

  const actionRef = useRef<ActionType>();
  const dispatch = useDispatch<AppDispatch>();
  const { users, isLoading, total } = useSelector((state: RootState) => state.user);

  const [modalVisible, setModalVisible] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 10 }));
  }, [dispatch]);


  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      message.success('User deleted successfully');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || 'Failed to delete user');
    }
  };

  const handleCreate = () => {
    setEditUser(null);
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setModalVisible(true);
  };

  const handleModalOk = async (values: Partial<User>) => {
    try {
      if (editUser) {
        await dispatch(updateUser({ id: editUser.id, userData: values })).unwrap();
        message.success('User updated successfully');
      } else {
        // Only send required fields for createUser
        const { email, password, name, role } = values;
        await dispatch(createUser({ email, password, name, role } as any)).unwrap();
        message.success('User created successfully');
      }
      setModalVisible(false);
      setEditUser(null);
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || 'Operation failed');
    }
  };

  const columns: ProColumns<User>[] = [
    {
      title: 'FirstName',
      dataIndex: 'firstName',
      sorter: true,
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'LastName',
      dataIndex: 'lastName',
      sorter: true,
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      copyable: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      valueType: 'select',
      valueEnum: {
        admin: { text: 'Admin', status: 'Success' },
        user: { text: 'User', status: 'Default' },
        manager: { text: 'Manager', status: 'Processing' },
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
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>,
        <Popconfirm
          key="delete"
          title="Are you sure you want to delete this user?"
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
    <>
      <ProTable<User>
        headerTitle="Users Management"
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
            onClick={handleCreate}
          >
            Add User
          </Button>,
        ]}
        request={async (params = {}, sort, filter) => {
          const { current, pageSize, name, email, role } = params;
          
          await dispatch(fetchUsers({
            page: current || 1,
            limit: pageSize || 10,
            search: name || email,
          }));

          return {
            data: users,
            success: true,
            total: total,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (selectedRowKeys, selectedRows) => {
            console.log('Selected:', selectedRowKeys, selectedRows);
          },
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />
      <UserFormModal
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditUser(null); }}
        onOk={handleModalOk}
        initialValues={editUser || undefined}
        isEdit={!!editUser}
      />
    </>
  );
};

export default Users;
