import Sider from 'antd/es/layout/Sider';
import Sidebar from './sidebarContent';
import { useMicrogrid } from '../../context/useMicrogridContext';

const SidebarComponent = () => {
	const {collapsed, toggleCollapsed} = useMicrogrid();
	return (
		<Sider className='!fixed !h-screen z-50' collapsible collapsed={collapsed} onCollapse={() => toggleCollapsed()}>
			<Sidebar collapsed={collapsed} />
		</Sider>
	);
};

export default SidebarComponent;
