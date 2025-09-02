import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { User } from '../../store/slices/userSlice';

interface UserFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: Partial<User>) => void;
  initialValues?: Partial<User>;
  isEdit?: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ visible, onCancel, onOk, initialValues, isEdit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialValues || {});
    }
  }, [visible, initialValues, form]);

  return (
    <Modal
      open={visible}
      title={isEdit ? 'Edit User' : 'Add User'}
      okText={isEdit ? 'Update' : 'Create'}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            onOk(values);
            form.resetFields();
          });
      }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please input the email!' }]}> 
          <Input type="email" />
        </Form.Item>
        {!isEdit && (
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input the password!' }]}> 
            <Input.Password />
          </Form.Item>
        )}
        <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role!' }]}> 
          <Select options={[
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' },
            { label: 'Manager', value: 'manager' },
          ]} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
