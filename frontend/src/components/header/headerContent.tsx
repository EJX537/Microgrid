import { Button } from 'antd';
import {
	BellFilled,
	ContainerFilled,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useMicrogrid } from '../../context/useMicrogridContext';


const HeaderContent = () => {
	const { collapsed, toggleCollapsed } = useMicrogrid();
	return (
		<div className="!w-full flex items-center bg-gray-400 justify-between">
			<Button
				className='!w-16 !h-16'
				type="text"
				icon={collapsed ? <MenuUnfoldOutlined className='text-white' /> : <MenuFoldOutlined className='text-white'/>}
				onClick={() => toggleCollapsed()}
			/>
			<div className={`flex ml-auto items-center ${collapsed ? 'mr-20' : 'mr-[200px]'}`}>
				<Button
					className='!w-16 !h-16 rounded-lg'
					type="text"
					icon={<ContainerFilled className='text-white' />}
				/>
				<Button
					className='!w-16 !h-16 rounded-lg'
					type="text"
					icon={<BellFilled className='text-white' />}
				/>
			</div>
		</div>
	);
};

export default HeaderContent;
