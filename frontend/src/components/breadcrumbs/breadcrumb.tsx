import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const BreadcrumbComponent = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const pathArray = location.pathname.split('/').filter(Boolean).map(path => path.replace(/%20/g, ' '));

	const breadcrumbItems = pathArray.map((path, index) => {
		if (index === 0) {
			return {
				onClick: () => path === 'Dashboard' ? navigate('/Dashboard') : null,
				title: <>
					{path === 'Dashboard' ? <HomeOutlined /> : <> </>}
					<span>{path}</span>
				</>
			};
		} else {
			return {
				onClick: () => navigate('/' + pathArray.slice(0, index + 1).join('/')),
				title: <span>{path}</span>
			};
		}
	});

	return (
		<div className='mt-16 pl-6'>
			<Breadcrumb className='my-2' items={breadcrumbItems} />
		</div>
	);
};

export default BreadcrumbComponent;
