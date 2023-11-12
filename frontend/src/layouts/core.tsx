import { Layout } from 'antd';
import { HeaderComponent, SidebarComponent } from '../components';
import { Content, Footer } from 'antd/es/layout/layout';
import RoutesProvider from '../routes/routes';
import { useMicrogrid } from '../context/useMicrogridContext';

// Fixed sidebar on left and fixed header on top
const CoreLayout = () => {
	const { collapsed } = useMicrogrid();
	return (
		<Layout hasSider className='min-h-screen h-auto w-full font-serif'>
			<SidebarComponent />
			<Layout style={{ transition: 'margin-left .2s', marginLeft: collapsed ? 80 : 200 }} className='min-h-screen !min-w-[600px] w-full flex flex-col justify-between'>
				<HeaderComponent />
				<Content className='h-full bg-white w-full mt-16'>
					<RoutesProvider />
				</Content>
				<Footer> Microgird Designs™©</Footer>
			</Layout>
		</Layout>
	);
};

export default CoreLayout;
