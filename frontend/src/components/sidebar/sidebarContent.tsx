import React, { useEffect, useState } from 'react';

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
	getItem('Dashboard', '/dashboard', <AppstoreOutlined />),
	getItem('Sol-Ark', 'Sol-Ark', <DesktopOutlined />, [
		getItem('Data View', '/sol-ark/data%20view', <BarChartOutlined />),
		getItem('Configure', '/sol-ark/config', <SettingOutlined />),
		getItem('Link', 'Sol-Ark OUTLINK', <LinkOutlined />)
	]),
	getItem('eGauge', 'eGauge', <DesktopOutlined />, [
		getItem('Data View', '/egauge/data%20view', <BarChartOutlined />),
		getItem('Configure', '/egauge/config', <SettingOutlined />),
		getItem('Link', 'eGauge OUTLINK', <LinkOutlined />)
	]),
	getItem('Add Device', '/add%20device', <PlusOutlined />),
	getItem('Backup Cloud', '/backup%20cloud', <CloudOutlined />),
	getItem('Log', '/log', <FileTextOutlined />),
	getItem('Settings', '/settings', <SettingOutlined />),
];

const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
	const navigate = useNavigate();
	const [selectedKey, selectKey] = useState(['']);
	const pathname = window.location.pathname.toLowerCase();

	useEffect(() => {
		selectKey([pathname]);
	}, [pathname]);

	// When Link is click it does not select it as an active value for the menu
	const handleOnclick = (e: { key: string }) => {
		if (e.key.includes('OUTLINK')) {
			window.open('http://google.com');
			return;
		}
		switch (e.key) {
		case 'Dashboard':
			navigate('/');
			return;
		case 'Add Device':
			navigate('/addDevice');
			return;
		case 'Backup Cloud':
			navigate('/backupCloud');
			return;
		case 'Log':
			navigate('/log');
			return;
		case 'Settings':
			navigate('/settings');
			return;
		default:
			navigate(`${e.key}`);
			break;
		}
	};

	return (
		<div>
			<div className={`bg-gray-400 m-3 py-2 text-center rounded-lg overflow-hidden ${collapsed ? '' : ''}`}>
				Microgrid Manager
			</div>
			<Menu theme="dark" mode="inline" selectedKeys={selectedKey} items={items_mock} onClick={handleOnclick} />
		</div>
	);
};

export default Sidebar;
