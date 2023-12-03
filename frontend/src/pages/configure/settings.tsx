import { useEffect, useState } from 'react';
import { FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import SettingGeneral from './settingGeneral';
import SettingLog from './setttingLog';
import { useLocation } from 'react-router-dom';

const items: MenuProps['items'] = [
	{
		label: 'General',
		key: 'General',
		icon: <SettingOutlined />,
	},
	{
		label: 'Log',
		key: 'Log',
		icon: <FileTextOutlined />
	}
];

const Settings = () => {
	const [current, setCurrent] = useState('General');
	const location = useLocation();
	const [device, setDevice] = useState('');

	useEffect(() => {
		const pathname = location.pathname.split('/');
		if (pathname[1]) setDevice(pathname[1]);
	}, [location.pathname]);

	const onClick: MenuProps['onClick'] = (e) => {
		setCurrent(e.key);
		console.log(device);
	};

	return (
		<div className="p-4 w-full h-full flex flex-col">
			<Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
			{
				current === 'General' ? <SettingGeneral /> : <SettingLog />
			}
		</div>
	);
};

export default Settings;
