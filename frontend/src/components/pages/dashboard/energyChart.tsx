import React, { useState, useEffect } from 'react';
import { DatePicker, Radio } from 'antd';
import dayjs from 'dayjs';
import DualYAxisAreaChart from './overviewEnergyUsageChart_d3';

const EnergyUsageChart = () => {
	const [data, setData] = useState([]);
	const [active, setActive] = useState('Day');
	const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
	const [dateTime, setDateTime] = useState(dayjs());

	useEffect(() => {
	}, []);

	return (
		<div className='h-full w-full flex flex-col p-4'>
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
			<div className='h-full'>
				<DualYAxisAreaChart />
			</div>
		</div>
	);
};

export default EnergyUsageChart;
