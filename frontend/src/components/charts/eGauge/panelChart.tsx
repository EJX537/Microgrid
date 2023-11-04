import { useEffect, useRef, useState } from 'react';
import PanelChartSVG, { PanelChartSVGData } from './panelChartSVG';
import * as d3 from 'd3';

const PanelChart = () => {
	const parentRef = useRef<HTMLDivElement | null>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [data, setData] = useState<PanelChartSVGData[]>([]);
	const [target, setTarget] = useState('');

	useEffect(() => {
		if (parentRef.current) {
			setDimensions({
				width: parentRef.current.offsetWidth,
				height: parentRef.current.offsetHeight
			});
		}
	}, [parentRef]);

	useEffect(() => {
		d3.csv('./data.csv').then((data: any[]) => {
			const parsedData = data.map((d) => ({
				dateTime: new Date((d['Date & Time'])),
				value: d['Panel3 (Kitchen) [kW]'] as number,
				unit: 'kW'
			}));
			setData(parsedData);
			setTarget('kW');
		});
	}, []);


	return (
		<div className='w-full flex-grow' ref={parentRef}>
			<PanelChartSVG height={dimensions.height} width={dimensions.width} data={data} unit={target}/>
		</div>
	);
};

export default PanelChart;
