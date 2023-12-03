import { Button, Form, Input } from 'antd';

type FieldType = {
	username?: string;
	password?: string;
};

const SettingGeneral = () => {
	const device = {
		status: true
	};

	return (
		<div className="flex flex-col p-4">
			<div className="flex flex-row justify-between p-2 w-full">
				<div className="flex flex-col max-w-[60%] w-full">
					<h1 className="text-xl font-bold">
						Device Name
					</h1>
					<h2 className="ml-2 mt-2 text-gray-400">
						Set the device name to something more meaningful.
					</h2>
				</div>
				<div className='mx-4 flex flex-col items-center gap-y-4 mr-4 max-w-[40%] w-full p-2'>
					<Input placeholder="Device Name" className='' />
					<Button className='bg-gray-400 text-gray-100 rounded-3xl px-6 text-lg h-full'>
						Update
					</Button>
				</div>
			</div>
			<div className='border-t border-gray-200 h-0.5 my-2' />
			<div className="flex flex-row justify-between p-2 w-full">
				<div className="flex flex-col max-w-[60%] w-full">
					<h1 className="text-xl font-bold">
						Permission
					</h1>
					<h2 className="ml-2 mt-2 text-gray-400">
						Set the device permission in order to access the device.
						<br />
						This is required to access the device and update permission.
					</h2>
				</div>
				<Form
					autoComplete="off"
					className='mx-4 flex flex-col items-center gap-y-1 mr-4 max-w-[40%] w-full p-2'>
					<Form.Item<FieldType>
						label="Username"
						name="username"
						className='w-full'
						rules={[{ required: true, message: 'Please input your username!' }]}>
						<Input />
					</Form.Item>
					<Form.Item<FieldType>
						label="Password"
						name="password"
						className='w-full'
						rules={[{ required: true, message: 'Please input your password!' }]}>
						<Input.Password />
					</Form.Item>
					<Form.Item>
						<Button className='bg-gray-400 text-gray-100 rounded-3xl px-6 text-lg h-full'>
							Update
						</Button>
					</Form.Item>
				</Form>
			</div>
			<div className='border-t border-gray-200 h-0.5 my-2' />
			<div className="flex flex-row justify-between p-2 w-full">
				<div className="flex flex-col max-w-[60%] w-full">
					<h1 className="text-xl font-bold">
						Change Outlink
					</h1>
					<h2 className="ml-2 mt-2 text-gray-400">
						Link to the dashboard of the device.
					</h2>
				</div>
				<div className='mx-4 flex flex-col items-center gap-y-4 mr-4 max-w-[40%] w-full p-2'>
					<Input placeholder="Outlink" />
					<Button className='bg-gray-400 text-gray-100 rounded-3xl px-6 text-lg h-full'>
						Update
					</Button>
				</div>
			</div>
			<div className='border-t border-gray-200 h-0.5 my-2' />
			<div className="flex flex-row justify-between p-2 w-full">
				<div className="flex flex-col max-w-[60%] w-full">
					<h1 className="text-xl font-bold">
						Device Status
					</h1>
					<h2 className="ml-2 mt-2 text-gray-400">
						If you want to stop or start the device, click the button to the side.
					</h2>
				</div>
				<div className='mx-4 flex flex-col items-center justify-center mr-4 max-w-[40%] w-full'>
					<Button className='bg-gray-400 text-gray-100 rounded-3xl px-6 text-lg h-fit'>
						{device.status ? 'Turn Off' : 'Turn On'}
					</Button>
				</div>
			</div>
			<div className='border-t border-gray-200 h-0.5 my-2' />
		</div>
	);
};

export default SettingGeneral;
