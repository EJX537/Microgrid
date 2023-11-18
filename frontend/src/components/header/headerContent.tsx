import { Badge, Button, Popover } from 'antd';
import {
	BellFilled,
	ContainerFilled,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useMicrogrid } from '../../context/useMicrogridContext';
import { useState } from 'react';


const content_process = (
	<div className='w-full flex flex-col gap-2'>
		<p>
			No ongoing processes
		</p>
		<div className='border-t border-gray-200 h-0.5' />
		<Button className='w-full'>
			Clear
		</Button>
	</div>
);

const content_notification = (
	<div className='w-full flex flex-col gap-2'>
		<p>
			Expect Heavy Rainfall and Low Visability
		</p>
		<div className='border-t border-gray-200 h-0.5' />
		<Button className='w-full'>
			Clear
		</Button>
	</div>
);

const HeaderContent = () => {
	const { collapsed, toggleCollapsed } = useMicrogrid();
	const [openNotificaion, setOpenNotificaion] = useState(false);
	const [openProcess, setOpenProcess] = useState(false);

	const handleOpenNotificaion = (newOpen: boolean) => {
		setOpenNotificaion(newOpen);
	};

	const handleOpenProcess = (newOpen: boolean) => {
		setOpenProcess(newOpen);
	};

	return (
		<div className="w-full flex items-center bg-gray-400 justify-between">
			<Button
				className='!w-16 !h-16'
				type="text"
				icon={collapsed ? <MenuUnfoldOutlined className='text-white' /> : <MenuFoldOutlined className='text-white' />}
				onClick={() => toggleCollapsed()}
			/>
			<div className={`flex ml-auto items-center ${collapsed ? 'mr-[80px]' : 'mr-[200px]'}`}>
				<Popover
					placement='bottomRight'
					trigger="click"
					open={openProcess}
					onOpenChange={handleOpenProcess}
					content={content_process}>
					<Button
						className='!w-16 !h-16 rounded-lg'
						type="text"
						icon={
							<Badge count={0} size='small'>
								<ContainerFilled className='text-white' />
							</Badge>
						}
					/>
				</Popover>
				<Popover
					placement='bottomRight'
					trigger="click"
					content={content_notification}
					open={openNotificaion}
					onOpenChange={handleOpenNotificaion}>
					<Button
						className='!w-16 !h-16 rounded-lg'
						type="text"
						icon={
							<Badge count={1} size='small'>
								<BellFilled className='text-white' />
							</Badge>
						}
					/>
				</Popover>
			</div>
		</div>
	);
};

export default HeaderContent;
