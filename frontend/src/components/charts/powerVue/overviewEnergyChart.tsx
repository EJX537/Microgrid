import { useState, useEffect, useRef } from 'react';
import { useWindow } from '../../context/useWindowContext';
import DualYAxisAreaChartSVG from './DualYAxisAreaChartSVG';

export interface DataTypeWattHour {
	dateTime: Date;
	source: string;
	watt: number;
}

const date = new Date();
date.setHours(0, 0, 0, 0);
const dateTime: Date[] = [date];
for (let i = 1; i < 60; i++) {
	const time = new Date(date.getTime());
	time.setHours(i);
	dateTime.push(time);
}

const data1: DataTypeWattHour[] = dateTime.map((entry) => ({
	dateTime: entry, watt: Math.floor(Math.random() * 8001) - 3000, source: 'eGuage'
}));

const data2: DataTypeWattHour[] = dateTime.map((entry) => ({
	dateTime: entry, watt: Math.floor(Math.random() * 5001), source: 'battery'
}));

const data3: DataTypeWattHour[] = dateTime.map((entry) => ({
	dateTime: entry, watt: Math.floor(Math.random() * 8001) - 3000, source: 'PowerVue'
}));

const data = {
	'eGuage': data1,
	'battery': data2,
	'PowerVue': data3
};

const EnergyUsageChart = () => {
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const parentRef = useRef<HTMLDivElement | null>(null);
	const { width, height } = useWindow();
	useEffect(() => {
		if (parentRef.current) {
			setDimensions({
				width: parentRef.current.offsetWidth,
				height: parentRef.current.offsetHeight
			});
		}
	}, [parentRef, width, height]);

	return (
		<div className='p-4 flex-grow relative' ref={parentRef}>
			<DualYAxisAreaChartSVG parent={parentRef} height={dimensions.height} width={dimensions.width} data={data} capacity={5000}/>
		</div>
	);
};

export default EnergyUsageChart;
