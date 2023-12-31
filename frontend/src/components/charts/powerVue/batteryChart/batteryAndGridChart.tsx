import { useEffect, useRef, useState } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { Tooltip, Input, Alert } from 'antd';

import BatteryCapacitySVG from './batteryCapacitySVG';

import battery from '../../../../assets/battery.svg';
import timer from '../../../../assets/timer.svg';

import { Config, DataRequest_Once, DataStream } from './batteryChartTypes';
import { useMicrogrid } from '../../../../context/useMicrogridContext';

const mockData: DataRequest_Once = {
	capacity: 15000,
};

type TooltipInfo = {
	warning: string;
	danger: string;
	animationSpeed: string;
	[key: string]: string;
};


const tooltipInfo: TooltipInfo = {
	'warning': 'The yellow when battery is at __% capacity',
	'danger': 'The red when battery is at __% capacity',
	'animationSpeed': 'The speed at which the battery animation plays in ms (between 1000 and 10000)',
};

const BatteryChart = () => {
	const parentRef = useRef<HTMLDivElement | null>(null);
	const eventSourceRef = useRef<EventSource | null>(null);
	const { config, setConfig } = useMicrogrid();
	const [configState, setConfigState] = useState(config.batteryChartConfigs);
	const [dataStream, setDataSteam] = useState<DataStream>({} as DataStream);
	const [showConfig, setShowConfig] = useState(false);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [showAlert, setShowAlert] = useState({ content: '', show: false });
	useEffect(() => {
		if (parentRef.current) {
			setDimensions({
				width: parentRef.current.offsetWidth,
				height: parentRef.current.offsetHeight
			});
		}
	}, [parentRef]);

	useEffect(() => {
		if (!eventSourceRef.current) {
			eventSourceRef.current = new EventSource('http://localhost:8080/powerview');
			eventSourceRef.current.onmessage = (e) => {
				const data = JSON.parse(e.data);
				setDataSteam(data);
			};
		}
	}, []);

	const handleSave = () => {
		const isValid = Object.values(configState).every((value) => value !== undefined && value !== null);
		const isWarningValid = configState.warning >= 0 && configState.warning <= 1;
		const isDangerValid = configState.danger >= 0 && configState.danger <= 1;
		const isAnimationSpeedValid = configState.animationSpeed >= 1000 && configState.animationSpeed <= 10000;
		if (isValid && isWarningValid && isDangerValid && isAnimationSpeedValid) {
			setConfig({ ...config, batteryChartConfigs: configState });
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
		<div className='w-full flex flex-col h-auto flex-grow relative'>
			<div className='text-lg px-2 justify-between flex'>
				<span>
					Solar & Battery Status
				</span>
				<button className='transition-opacity opacity-0 group-hover:opacity-100' onClick={() => { setShowConfig(!showConfig); setConfigState(config.batteryChartConfigs); }}>
					<SettingOutlined />
				</button>
			</div>
			<div className='border-t border-black h-0.5 my-2' />
			<div className='px-2 pt-2 h-full max-h-[350px]' ref={parentRef}>
				<BatteryCapacitySVG data={dataStream} height={dimensions.height} width={dimensions.width} capacity={mockData.capacity} config={config.batteryChartConfigs} />
			</div>
			<div className='px-2 flex justify-evenly gap-2'>
				<div className='flex items-center gap-2'>
					<img className='h-10 w-10 flex content-center' src={battery} />
					<div className='flex flex-col '>
						<span className='text-blue-300 text-lg'>
							{mockData.capacity / 1000}kWh
						</span>
						<span>
							Capacity
						</span>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					<img src={timer} className='flex items-center h-10 w-10' />
					<div className='flex flex-col '>
						<Tooltip className='text-green-400 text-lg' title='Target Battery Charge: 100%'>
							Low Risk
						</Tooltip>
						<span>
							Mode
						</span>
					</div>
				</div>
			</div>
			<div className={`absolute h-full items-center justify-center flex left w-full ${showConfig ? '' : 'hidden'}`}>
				<div className='bg-slate-200 sm:w-1/2 w-4/5 flex h-full p-4 rounded-md flex-col'>
					<span>
						Modify Config
					</span>
					<div className='border-t border-black h-0.5 my-2' />
					<div className='flex flex-col overflow-auto gap-y-2'>
						{
							Object.entries(configState).map(([key, value]) => {
								return (
									<div key={key}>
										<Tooltip title={tooltipInfo[key]}>{key}: </Tooltip>
										<Input
											placeholder={value}
											onChange={(e) => {
												setConfigState((prevState) => ({
													...prevState,
													[key]: e.target.value,
												}));
											}} />
									</div>
								);
							})
						}
					</div>
					<div className='flex gap-4 mt-auto justify-between'>
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

export default BatteryChart;
