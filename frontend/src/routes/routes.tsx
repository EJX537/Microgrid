import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/dashboard/dashboard';
import Page404 from '../page404';
import DeviceOneSettings from '../pages/dashboard/deviceOneSettings';

const RoutesProvider = () => {
	return (
		<Routes>
			<Route path="/" element={<Dashboard />} />
			<Route path = "/b" element={<DeviceOneSettings/>} />
			<Route path="*" element={<Page404 />} />
		</Routes>
	);
};

export default RoutesProvider;
