import { Routes, Route } from 'react-router-dom';
import { Dashboard, DeviceOneSettings, Page404 } from '../pages';

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
