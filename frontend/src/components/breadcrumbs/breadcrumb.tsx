import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';

const BreadcrumbComponent = () => {
	return (
		<Breadcrumb className='mt-16 p-4 pl-6'
			items={[
				{
					href: '/',
					title: <>
						<HomeOutlined />
						<span>Dashboard</span>
					</>
				},
			]}
		/>
	);
};

export default BreadcrumbComponent;
