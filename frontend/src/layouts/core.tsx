import { Layout } from 'antd';
import { HeaderComponent, SidebarComponent } from '../components';
import { Content, Footer } from 'antd/es/layout/layout';
import RoutesProvider from '../routes/routes';
import { useMicrogrid } from '../context/useMicrogridContext';

// Fixed sidebar on left and fixed header on top
const CoreLayout = () => {
	const { collapsed } = useMicrogrid();
	return (
		<Layout hasSider className='h-screen w-screen font-serif'>
			<SidebarComponent />
			<Layout style={{ transition: 'margin-left .2s', marginLeft: collapsed ? 80 : 200 }} className='h-full !min-w-[600px] w-full flex flex-col'>
				<HeaderComponent />
				<Content className='h-full bg-white w-full'>
					<RoutesProvider />
				</Content>
				<Footer className=''> Microgird Designs™©</Footer>
			</Layout>
		</Layout>
	);
};

export default CoreLayout;
