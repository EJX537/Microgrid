import { useEffect, useRef, useState } from 'react';
import PanelChartSVG from './panelChartSVG';
import { readSSEResponse } from './hooks/eGaugeDataRequester';

import { eGaugeData, Config } from './eGaugeTypes';
// const event = ;

interface PanelChartProps {
	source: string;
}

const PanelChart: React.FC<PanelChartProps> = ({ source }) => {
	const parentRef = useRef<HTMLDivElement | null>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [data, setData] = useState<eGaugeData[]>([]);
	const [target, setTarget] = useState('');
	const [showConfig, setShowConfig] = useState(false);
	const [showAlert, setShowAlert] = useState({ content: '', show: false });
	const [configState, setConfigState] = useState({} as Config);

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

	const handleSave = () => {
	};


	return (
		<div className='w-full flex-grow relative' ref={parentRef}>
			<PanelChartSVG height={dimensions.height} width={dimensions.width} data={data} unit={target} parent={parentRef} />
			<div className={`absolute h-full items-center justify-center flex left w-full ${showConfig ? '' : 'hidden'}`}>
				<div className='bg-slate-200 w-1/2 flex h-full p-4 rounded-md flex-col'>
					<span>
						Modify Config
					</span>
					<div className='border-t border-black h-0.5 my-2' />
					<div className='flex flex-col overflow-auto gap-y-2'>

					</div>
					<div className='flex gap-4 mt-auto'>
						<button className='border py-1 px-2 rounded-lg border-black hover:bg-slate-100' onClick={handleSave}>
							Save
						</button>
						<button className='border py-1 px-2 rounded-lg border-black hover:bg-slate-100' onClick={() => { setShowConfig(false); setConfigState({} as Config); }}>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PanelChart;
