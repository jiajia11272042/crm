import React from 'react';
import { Outlet, useNavigate, useLocation } from 'umi';
import { Layout, Menu } from 'antd';
import { HomeOutlined, PlusOutlined, UnorderedListOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Content, Sider } = Layout;

const ProductAuditPlatform = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#fff' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16 }}>
          产品审核平台
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ height: '100%', borderRight: 0 }}
          items={[
            {
              key: '/product-audit/list',
              icon: <UnorderedListOutlined />,
              label: '产品列表',
            },
            {
              key: '/product-audit/category',
              icon: <HomeOutlined />,
              label: '分类管理',
            },
            {
              key: '/product-audit/approval',
              icon: <CheckCircleOutlined />,
              label: '审批列表',
            },
          ]}
          onClick={(e) => {
            navigate(e.key);
          }}
        />
      </Sider>
      <Layout style={{ flex: 1 }}>
        <Content style={{ margin: '24px', background: '#fff', padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProductAuditPlatform;