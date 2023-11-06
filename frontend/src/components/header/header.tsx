import { Header } from 'antd/es/layout/layout';
import HeaderContent from './headerContent';

const HeaderComponent = () => {
	return (
		<Header className='p-0 bg-white h-16 z-50 !fixed w-full'>
			<HeaderContent />
		</Header>
	);
};

export default HeaderComponent;
