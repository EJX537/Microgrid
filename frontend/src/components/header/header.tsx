import { Header } from 'antd/es/layout/layout';
import HeaderContent from './headerContent';
import { useMicrogrid } from '../../context/useMicrogridContext';

const HeaderComponent = () => {
	const { collapsed, setCollapsed } = useMicrogrid();
	return (
		<Header className='p-0 bg-white !h-14 z-50 !fixed w-full'>
			<HeaderContent collapsed={collapsed} setCollapsed={setCollapsed} />
		</Header>
	);
};

export default HeaderComponent;
