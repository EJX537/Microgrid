import { Button, Select } from 'antd';

const options = [
	{ value: '1 seconds', label: '1 seconds' },
	{ value: '2 seconds', label: '2 seconds' },
	{ value: '3 seconds', label: '3 seconds' },
	{ value: '5 seconds', label: '5 seconds', },
	{ value: '10 seconds', label: '10 seconds', },
	{ value: '30 seconds', label: '30 seconds', },
	{ value: '1 minute', label: '1 minute', },
	{ value: '2 minute', label: '2 minute', },
	{ value: '5 minute', label: '5 minute', },
];

const SettingLog = () => {
	return (
		<div className="flex flex-col p-4">
			<div className="flex flex-row justify-between p-2 w-full">
				<div className="flex flex-col max-w-[60%] w-full">
					<h1 className="text-xl font-bold">
						Log Frequency
					</h1>
					<h2 className="ml-2 mt-2 text-gray-400">
						How often do you want to log the data?
					</h2>
				</div>
				<div className='mx-4 flex flex-col items-center gap-y-4 mr-4 max-w-[40%] w-full p-2'>
					<Select
						className='w-full'
						defaultValue="1 seconds"
						options={options}
					/>
					<Button className='bg-gray-400 text-gray-100 rounded-3xl px-6 text-lg h-full'>
						Update
					</Button>
				</div>
			</div>
			<div className='border-t border-gray-200 h-0.5 my-2' />
		</div>
	);
};

export default SettingLog;
