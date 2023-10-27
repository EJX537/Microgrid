import React, { useState } from 'react';

import { Layout } from 'antd';

import Sidebar from './components/sidebar';
import HeaderContent from './components/headerContent';

import MicrogridProvider from './components/context/contextProvider';
import RoutesProvider from './components/routes/routes';
import { BrowserRouter as Router } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;
const App: React.FC = () => {
  // Collapsable Sidebar
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Router>
      <MicrogridProvider>
        <Layout hasSider className='min-h-screen min-w-screen font-serif'>
          <Sider className='!fixed !h-screen z-50' collapsible collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)}>
            <Sidebar collapsed={collapsed} />
          </Sider>

          <Layout style={{ transition: 'margin-left .2s', marginLeft: collapsed ? 80 : 200 }} className='min-h-screen !min-w-[600px] w-full'>

            <Header className='p-0 bg-white !h-14 z-50 fixed w-full'>
              <HeaderContent collapsed={collapsed} setCollapsed={setCollapsed} />
            </Header>

            <Content className='mt-16 h-full bg-white w-full'>
              <RoutesProvider />
            </Content>

            <Footer> Microgird Designs™©</Footer>

          </Layout>
        </Layout>
      </MicrogridProvider>
    </Router>
  );
};

export default App;
