import Sider from 'antd/es/layout/Sider';
import SidebarContent from './sidebarContent';
import { useMicrogrid } from '../../context/useMicrogridContext';

const SidebarComponent = () => {
	const {collapsed, toggleCollapsed} = useMicrogrid();
	return (
		<Sider className='!fixed h-full z-50' collapsible collapsed={collapsed} onCollapse={() => toggleCollapsed()}>
			<SidebarContent collapsed={collapsed} />
		</Sider>
	);
};

export default SidebarComponent;
