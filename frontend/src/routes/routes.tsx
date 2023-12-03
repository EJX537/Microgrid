import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard, DataView, Page404, Settings, DeviceManagement, LogPage, GeneralSetting } from '../pages';

const RoutesProvider = () => {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/dashboard" replace />} />
			<Route path="/dashboard" element={<Dashboard />} />
			<Route path="/:deviceName/*"
				element={
					<Routes>
						<Route path="/Data View" element={<DataView />} />
						<Route path="/Config" element={<Settings />} />
						<Route path="/*" element={<Navigate to="/404" replace />} />
					</Routes>
				} />
			<Route path="/Add Device" element={<DeviceManagement />} />
			<Route path="/Backup Cloud" element={<Page404 />} />
			<Route path="/Log" element={<LogPage />} />
			<Route path="/Settings" element={<GeneralSetting />} />
			<Route path="*" element={<Navigate to="/404" replace />} />
			<Route path="/404" element={<Page404 />} />
		</Routes>
	);
};

export default RoutesProvider;
