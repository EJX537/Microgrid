import { useEffect, useRef, useState } from 'react';
import PanelChartSVG from './panelChartSVG';
import { readSSEResponse } from './hooks/eGaugeDataRequester';

import { eGaugeData } from './eGaugeTypes';
// const event = ;

interface PanelChartProps {
	source: string;
}

const PanelChart: React.FC<PanelChartProps> = ({ source }) => {
	const parentRef = useRef<HTMLDivElement | null>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [data, setData] = useState<eGaugeData[]>([]);
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
		setTarget('W');
		const eventSource = readSSEResponse(new URL(source));
		eventSource.onmessage = (event) => {
			const parsedData: eGaugeData = JSON.parse(event.data);
			parsedData.dateTime = new Date(parsedData.dateTime);
			setData(prevData => [...prevData, parsedData]);
		};
		return () => {
			eventSource.close();
		};
	}, [source]);

	return (
		<div className='w-full flex-grow relative' ref={parentRef}>
			<PanelChartSVG height={dimensions.height} width={dimensions.width} data={data} unit={target} parent={parentRef}/>
		</div>
	);
};

export default PanelChart;
