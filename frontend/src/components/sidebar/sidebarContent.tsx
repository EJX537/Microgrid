import React, { useState } from 'react';

import {
	AppstoreOutlined,
	BarChartOutlined,
	CloudOutlined,
	FileTextOutlined,
	PlusOutlined,
	DesktopOutlined,
	SettingOutlined,
	LinkOutlined
} from '@ant-design/icons';

import { Menu, MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';

type MenuItem = Required<MenuProps>['items'][number];

const getItem = (
	label: React.ReactNode,
	key: React.Key,
	icon?: React.ReactNode,
	children?: MenuItem[],
	type?: 'group',
): MenuItem => {
	return {
		key,
		icon,
		children,
		label,
		type,
	} as MenuItem;
};

const items_mock: MenuProps['items'] = [
	getItem('Dashboard', '1', <AppstoreOutlined />, undefined, undefined),
	getItem('Sol-Ark', 'sub1', <DesktopOutlined />, [
		getItem('Data View', '2', <BarChartOutlined />, undefined, undefined),
		getItem('Configure', '3', <SettingOutlined />, undefined, undefined),
		getItem('Link', 'link1', <LinkOutlined />, undefined, undefined)
	]),
	getItem('eGauge', 'sub2', <DesktopOutlined />, [
		getItem('Data View', '5', <BarChartOutlined />),
		getItem('Configure', '6', <SettingOutlined />),
		getItem('Link', 'link2', <LinkOutlined />)
	]),
	getItem('Device 3', 'sub3', <DesktopOutlined />, [
		getItem('Data View', '8', <BarChartOutlined />),
		getItem('Configure', '9', <SettingOutlined />),
		getItem('Link', 'link3', <LinkOutlined />)
	]),
	getItem('Add Device', '12', <PlusOutlined />),
	getItem('Backup Cloud', '13', <CloudOutlined />),
	getItem('Log', '14', <FileTextOutlined />),
	getItem('Settings', '15', <SettingOutlined />),
];

const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
	const [selectedKey, selectKey] = useState(['1']);
	const navigate = useNavigate();
	// When Link is click it does not select it as an active value for the menu
	const handleOnclick = (e: {key: string} ) => {
		if (!e.key.includes('link')) {
			selectKey([e.key]);
		} else {
			window.open('http://google.com');
		}
		if (!e.key.includes('sub')) {
			switch (e.key) {
				case '1':
					navigate('/');
					break;
				case '2':
					navigate('/a');
					break;
				case '3':
					navigate('/b');
					break;
				default:
					navigate('/');
					break;
			}
		}
	};

	return (
		<div>
			<div className={`bg-gray-400 m-3 py-2 text-center rounded-lg overflow-hidden ${collapsed ? '' : ''}`}>
				Microgrid Manager
			</div>
			<Menu theme="dark" mode="inline" selectedKeys={selectedKey} items={items_mock} onClick={handleOnclick}/>
		</div>
	);
};

export default Sidebar;
