import React from 'react';

import {
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  TeamOutlined,
  PlusOutlined,
  DesktopOutlined,
  SettingOutlined,
  LinkOutlined
} from '@ant-design/icons';

import { Menu } from 'antd';
import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items_mock: MenuProps['items'] = [
  getItem('Dashboard', '1', <AppstoreOutlined />),
  getItem('Device 1', 'sub1', <DesktopOutlined />, [
    getItem('Data View', '2', <BarChartOutlined />),
    getItem('Configure', '3', <SettingOutlined />),
    getItem('Link', '4', <LinkOutlined />)
  ]),
  getItem('Device 2', 'sub2', <DesktopOutlined />, [
    getItem('Data View', '5', <BarChartOutlined />),
    getItem('Configure', '6', <SettingOutlined />),
    getItem('Link', '7', <LinkOutlined />)
  ]),
  getItem('Device 3', 'sub3', <DesktopOutlined />, [
    getItem('Data View', '8', <BarChartOutlined />),
    getItem('Configure', '9', <SettingOutlined />),
    getItem('Link', '10', <LinkOutlined />)
  ]),
  getItem('Add Device', '12', <PlusOutlined />),
  getItem('Backup Cloud', '13', <CloudOutlined />),
  getItem('???', '14', <TeamOutlined />),
  getItem('Settings', '15', <SettingOutlined />),
];

const Sidebar = ({collapsed}: {collapsed: boolean}) => {
  return (
    <div>
      <div className={`bg-gray-400 m-3 py-2 text-center rounded-lg overflow-hidden ${collapsed ? '' : ''}`}>
        Microgrid Manager
      </div>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} items={items_mock} inlineCollapsed={collapsed} />
    </div>
  );
};

export default Sidebar;
