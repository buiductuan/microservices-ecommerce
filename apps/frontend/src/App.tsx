import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/es/locale/en_US';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './components/Layout/Layout';
import RequireAuth from './components/Auth/RequireAuth';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Products from './pages/Products/Products';
import Orders from './pages/Orders/Orders';
import Notifications from './pages/Notifications/Notifications';
import Login from './pages/Login/Login';

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        locale={enUS}
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Routes>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
