import { useState } from 'react';
import { DatePicker, Radio, RadioChangeEvent } from 'antd';
import dayjs from 'dayjs';
import EnergyUsageChart from '../../charts/powerVue/overviewEnergyChart';

const EnergyUsage = () => {
	const [data, setData] = useState([]);
	const [active, setActive] = useState('date');
	const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
	const [dateTime, setDateTime] = useState(dayjs());


	const handleActive = (event: RadioChangeEvent) => {
		setActive(event.target.value);
		switch (event.target.value) {
			case 'date':
				setDateFormat('YYYY-MM-DD');
				setDateTime(dayjs().startOf('day'));
				break;
			case 'month':
				setDateFormat('YYYY-MM');
				setDateTime(dayjs().startOf('month'));
				break;
			case 'year':
				setDateFormat('YYYY');
				setDateTime(dayjs().startOf('year'));
				break;
			case 'total':
				setDateFormat('----');
				break;
		}
	};

	return (
		<div className='h-full w-full flex flex-col min-h-[500px] p-2'>
			<div className='text-lg'>
				Energy Generation
			</div>
			<div className='border-t border-black h-0.5 my-2' />
			<div className='mt-2 mb-4 w-full flex justify-between'>
				<Radio.Group value={active} onChange={handleActive}>
					<Radio.Button value='date'>
						Day
					</Radio.Button>
					<Radio.Button value='month'>
						Month
					</Radio.Button>
					<Radio.Button value='year'>
						Year
					</Radio.Button>
					<Radio.Button value='total'>
						Total
					</Radio.Button>
				</Radio.Group>
				<DatePicker
					value={dateTime}
					format={dateFormat}
					onChange={(date) => setDateTime(date ? date : dateTime)}
					picker={active as 'date' | 'week' | 'month' | 'year' | undefined}
					disabled={active === 'total'}
				/>
			</div>
			<EnergyUsageChart/>
		</div>
	);
};

export default EnergyUsage;

