import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';

const BreadcrumbComponent = () => {
	return (
		<div className='mt-16 pl-6'>
			<Breadcrumb className='my-2'
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
		</div>
	);
};

export default BreadcrumbComponent;
