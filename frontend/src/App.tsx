import React, { useState } from 'react';

import { Layout, theme } from 'antd';

import Sidebar from './components/sidebar';
import HeaderContent from './components/header_content';
import ExampleGraph from './components/sample_graph';

const { Header, Content, Footer, Sider } = Layout;
const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout hasSider>
      <Sider className='!fixed !h-screen' collapsible collapsed={collapsed} trigger={null}>
        <Sidebar collapsed={collapsed} />
      </Sider>
      <Layout style={{ transition: 'margin-left .2s', marginLeft: collapsed ? 80 : 200 }} className='min-h-screen min-w-[600px]'>
        <Header className='p-0 bg-white w-full z-50 fixed'>
          <HeaderContent collapsed={collapsed} setCollapsed={setCollapsed} />
        </Header>
        <Content className='flex-grow mx-5 mt-16 h-full'>
          <div style={{ background: colorBgContainer }} className='text-center p-6 pt-8 h-full flex flex-row flex-wrap justify-around'>
            <div className='w-[500px] h-[400px] mb-4 bg-gray-200 rounded-lg p-8'>
              <div className='h-[350px]'>
                <ExampleGraph />
              </div>
            </div>
            <div className='w-[500px] h-[400px] mb-4 bg-gray-200 rounded-lg p-8'>
              <div className='h-[350px]'>
                <ExampleGraph />
              </div>
            </div>
            <div className='w-[500px] h-[400px] mb-4 bg-gray-200 rounded-lg p-8'>
              <div className='h-[350px]'>
                <ExampleGraph />
              </div>
            </div>
          </div>
        </Content>
        <Footer> Microgird Designs</Footer>
      </Layout>
    </Layout>
  );
};

export default App;
