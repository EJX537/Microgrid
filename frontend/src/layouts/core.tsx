import { Layout } from 'antd';
import { BreadcrumbComponent, HeaderComponent, SidebarComponent } from '../components';
import { Content, Footer } from 'antd/es/layout/layout';
import RoutesProvider from '../routes/routes';
import { useMicrogrid } from '../context/useMicrogridContext';

const Core = () => {
	const { collapsed } = useMicrogrid();
	return (
		<Layout hasSider className='min-h-screen min-w-screen font-serif'>
			<SidebarComponent />
			<Layout style={{ transition: 'margin-left .2s', marginLeft: collapsed ? 80 : 200 }} className='min-h-screen !min-w-[600px] w-full'>
				<HeaderComponent />
				<BreadcrumbComponent />
				<Content className='h-full bg-white w-full'>
					<RoutesProvider />
				</Content>
				<Footer> Microgird Designs™©</Footer>
			</Layout>
		</Layout>
	);
};

export default Core;
