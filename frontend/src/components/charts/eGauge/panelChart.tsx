import { useEffect, useRef, useState } from 'react';
import PanelChartSVG from './panelChartSVG';
import { readSSEResponse } from './hooks/eGaugeDataRequester';

import { eGaugeData, Config } from './eGaugeTypes';
import { SettingOutlined } from '@ant-design/icons';
import { Alert, Input, Select, Tooltip } from 'antd';
import { useMicrogrid } from '../../../context/useMicrogridContext';

interface PanelChartProps {
	name: string;
	height?: number;
	width?: number;
}

type TooltipInfo = {
	source: string;
	title: string;
	period: string;
	[key: string]: string;
};

const tooltipInfo: TooltipInfo = {
	'source': 'End point to get data from',
	'title': 'Source of the Data',
	'period': 'How far back should the data be displayed',
};

const displayOptions = [
	{ value: '30 sec', label: '30 sec' },
	{ value: '1 minute', label: '1 minute' },
	{ value: '5 minute', label: '5 minute' },
	{ value: '10 minute', label: '10 minute' },
	{ value: '15 minute', label: '15 minute' },
	{ value: '30 minute', label: '30 minute' },
	{ value: '1 hour', label: '1 hour' },
];

const PanelChart: React.FC<PanelChartProps> = ({ name, height = 300, width = 330 }) => {
	const { config, setConfig } = useMicrogrid();
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const parentRef = useRef<HTMLDivElement | null>(null);
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
		const eventSource = readSSEResponse(new URL(config.chartCarouselConfigs[name].source));
		console.log(eventSource);
		eventSource.onmessage = (event) => {
			const parsedData: eGaugeData = JSON.parse(event.data);
			parsedData.dateTime = new Date(parsedData.dateTime);
			setData(prevData => [...prevData, parsedData]);
		};
		return () => {
			eventSource.close();
		};
	}, [config, name]);

	const handleEditInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setConfigState((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
	};

	const handleEditSelect = (value: string, target: string) => {
		setConfigState((prevState) => ({ ...prevState, [target]: value }));
	};

	const handleSave = () => {
		const isValid = Object.values(configState).every((value) => value !== undefined && value !== null);
		if (isValid) {
			setConfig({ ...config, chartCarouselConfigs: { ...config.chartCarouselConfigs, [name]: configState } });
			setConfigState({} as Config);
			setShowConfig(false);
			setShowAlert({ content: 'Success', show: true });
		} else {
			setShowAlert({ content: 'Invalid Input', show: true });
		}
		setTimeout(() => {
			setShowAlert({ content: '', show: false });
		}, 2000);
	};

	return (
		<div key='1' className={`h-[${height}px] w-[${width}px] bg-white rounded-md flex flex-col group relative`}>
			<div className='h-auto px-2 text-base font-mediums flex justify-between mb-2 items-center p-2'>
				<p>
					{name}
				</p>
				<button className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-ou' onClick={() => { setShowConfig(!showConfig); setConfigState(config.chartCarouselConfigs[name]); }}>
					<SettingOutlined />
				</button>
			</div>
			<div className='w-full flex-grow relative p-2' ref={parentRef}>
				<PanelChartSVG height={dimensions.height} width={dimensions.width} data={data} unit={target} parent={parentRef} config={config.chartCarouselConfigs[name]}/>
			</div>
			<div className={`absolute h-full items-center justify-center flex w-full ${showConfig ? '' : 'hidden'}`}>
				<div className='bg-slate-200 w-3/4 flex h-full p-4 rounded-md flex-col'>
					<span>
						Modify Config
					</span>
					<div className='border-t border-black h-0.5 my-2' />
					<div className='flex flex-col overflow-auto gap-y-2'>
						{
							Object.entries(config.chartCarouselConfigs[name]).map(([key, value]) => (
								<div key={key}>
									<Tooltip title={tooltipInfo[key]}>{key}: </Tooltip>
									{
										key === 'source' ?
											<Input
												placeholder={value}
												disabled={key === 'source'}
												onChange={handleEditInput} />
											:
											<Select
												className='w-full'
												defaultValue={value}
												options={displayOptions}
												onChange={(value: string) => handleEditSelect(value, 'period')} />
									}
								</div>
							))
						}
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
			{showAlert.show && <Alert className='absolute w-full' message={showAlert.content} type={showAlert.content === 'Success' ? 'success' : 'error'} showIcon />}
		</div>
	);
};

export default PanelChart;
