import { Table, Button } from 'antd';
import { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';

interface LogData {
	key: React.Key;
	dateTime: Date;
	message: string;
	deviceName?: string;
	status?: string;
}

const LogDataMock: LogData[] = [];

for (let i = 1; i <= 50; i++) {
	const dateTime = new Date();
	LogDataMock.push({
		key: i,
		dateTime: new Date(dateTime.getTime() + 30 * 1000 * i),
		message: `Log ${i}`,
		deviceName: `Device ${i}`,
		status: `Status ${i}`
	});
}

const columns: ColumnsType<LogData> = [
	{
		title: 'dateTime',
		width: 200,
		dataIndex: 'dateTime',
		key: 'dateTime',
		render: (dateTime: Date) => dateTime.toString(),
		fixed: 'left',
		sorter: (a: LogData, b: LogData) => a.dateTime.getTime() - b.dateTime.getTime(),
	},
	{
		title: 'device',
		width: 100,
		dataIndex: 'deviceName',
		key: 'deviceName',
		fixed: 'left',
		sorter: (a: LogData, b: LogData) => {
			if (a.deviceName && b.deviceName) {
				return a.deviceName.localeCompare(b.deviceName);
			} else if (a.deviceName) {
				return -1; // a is first if b is undefined
			} else {
				return 1; // b is first if a is undefined
			}
		},
	},
	Table.EXPAND_COLUMN,
	{
		title: 'message',
		dataIndex: 'message',
		key: 'message',
	},
	{
		title: 'status',
		dataIndex: 'status',
		key: 'status',
		width: 100,
	},
];

const LogPage = () => {
	const [logs, setLogs] = useState<LogData[]>([]);
	const pageSize = 10; // Set the number of items per page

	useEffect(() => {
		// Load initial data
		setLogs(LogDataMock.slice(0, pageSize));
	}, []);


	const loadMoreData = () => {
		// Load more data when button is clicked
		setLogs(LogDataMock.slice(0, logs.length + pageSize));
	};

	return (
		<div className='w-full h-full p-4'>
			<div className='text-lg font-semibold p-2'>
				Raw Logs
			</div>
			<Table
				className='w-full'
				columns={columns}
				dataSource={logs}
				scroll={{ x: 1300, y: 1050 }}
				expandable={{
					expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.message}</p>,
				}}
				pagination={false}
			/>
			<Button className='w-full' onClick={loadMoreData}>Load More</Button>

		</div>
	);
};

export default LogPage;
