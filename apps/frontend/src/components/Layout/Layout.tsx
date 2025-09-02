import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout, MenuDataItem } from '@ant-design/pro-components';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  BellOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

const menuData: MenuDataItem[] = [
  {
    path: '/',
    name: 'Dashboard',
    icon: <DashboardOutlined />,
  },
  {
    path: '/users',
    name: 'Users',
    icon: <UserOutlined />,
  },
  {
    path: '/products',
    name: 'Products',
    icon: <ShoppingOutlined />,
  },
  {
    path: '/orders',
    name: 'Orders',
    icon: <ShoppingCartOutlined />,
  },
  {
    path: '/notifications',
    name: 'Notifications',
    icon: <BellOutlined />,
  },
];

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div style={{ height: '100vh' }}>
      <ProLayout
        title="E-Commerce Admin"
        logo="https://gw.alipayobjects.com/zos/antfincdn/PmY%24TNNDBI/logo.svg"
        layout="mix"
        collapsed={collapsed}
        onCollapse={setCollapsed}
        location={{
          pathname: location.pathname,
        }}
        menuDataRender={() => menuData}
        menuItemRender={(item, dom) => (
          <div
            onClick={() => {
              navigate(item.path || '/');
            }}
          >
            {dom}
          </div>
        )}
        avatarProps={{
          src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
          title: user?.name || 'Admin',
          size: 'small',
        }}
        actionsRender={() => [
          <div
            key="logout"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '0 8px',
            }}
          >
            <LogoutOutlined />
            <span style={{ marginLeft: 8 }}>Logout</span>
          </div>,
        ]}
        headerTitleRender={() => (
          <div>E-Commerce Admin</div>
        )}
      >
        <div style={{ padding: '24px', minHeight: '100vh' }}>
          <Outlet />
        </div>
      </ProLayout>
    </div>
  );
};

export default Layout;
