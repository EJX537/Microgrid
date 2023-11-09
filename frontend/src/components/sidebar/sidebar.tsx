import Sider from 'antd/es/layout/Sider';
import Sidebar from './sidebarContent';
import { useMicrogrid } from '../../context/useMicrogridContext';

const SidebarComponent = () => {
	const {collapsed, setCollapsed} = useMicrogrid();
	return (
		<Sider className='!fixed !h-screen z-50' collapsible collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)}>
			<Sidebar collapsed={collapsed} />
		</Sider>
	);
};

export default SidebarComponent;
