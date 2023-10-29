// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// Ant Design Chart is a JS library, Ignore Type Errors Coming From it

import React, { useState, useEffect } from 'react';
import { Area } from '@ant-design/plots';
import { DatePicker, Radio } from 'antd';
import dayjs from 'dayjs';

const EnergyUsageChart = () => {
	const [data, setData] = useState([]);
	const [active, setActive] = useState('Day');
	const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
	const [dateTime, setDateTime] = useState(dayjs());

	useEffect(() => {
		asyncFetch();
	}, []);

	const asyncFetch = () => {
		fetch('https://gw.alipayobjects.com/os/bmw-prod/b21e7336-0b3e-486c-9070-612ede49284e.json')
			.then((response) => response.json())
			.then((json) => setData(json))
			.catch((error) => {
				console.log('fetch data failed', error);
			});
	};
	console.log(data);
	const config = {
		data,
		xField: 'date',
		yField: 'value',
		seriesField: 'country',
		legend: 'bottom',
		padding: [26, 0, 50, 40], // adjust padding as needed
		annotations: [
			{
				type: 'text',
				position: ['min', 'max'],
				content: '(W)', // replace 'unit' with your actual unit
				offsetY: -15,
				offsetX: -30,
				style: { textBaseline: 'bottom' },
			},
		],
										
		areaStyle: ({ country }) => {
			if (country === '北美') {
				return { fill: 'transparent' };
			}
		},
	};

	return (
		<div className='h-full w-full'>
			<div className='text-lg'>
				Energy Generation
			</div>
			<div className='border-t border-black h-0.5 my-2' />
			<div className='mt-2 mb-4 w-full flex justify-between'>
				<Radio.Group value={active} onChange={(e) => setActive(e.target.value)}>
					<Radio.Button value='Day'>
						Day
					</Radio.Button>
					<Radio.Button value='Month'>
						Month
					</Radio.Button>
					<Radio.Button value='Year'>
						Year
					</Radio.Button>
					<Radio.Button value='Total'>
						Total
					</Radio.Button>
				</Radio.Group>
				<DatePicker value={dateTime} format={dateFormat} onChange={(date) => setDateTime(date)}/>
			</div>
			<div>
				<Area {...config} />
			</div>
		</div>
	);
};

export default EnergyUsageChart;
