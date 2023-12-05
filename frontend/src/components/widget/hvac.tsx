import { useEffect, useState } from 'react';
import { Widget } from '../../interfaces/JSXTypes';
import { hvac } from './svgImports';
import { Slider } from 'antd';
import { SliderMarks } from 'antd/es/slider';

interface HVACData {
	dateTime: Date;
	status: boolean;
	temperature: number;
	unit: string;
	metaData?: []
}

// UNIT IS ONLY DISPLAY UNIT 
// Temperature is always stored in Celsius
interface HVACConfig {
	name: string;
	minTemperature: number;
	maxTemperature: number;
	unit: string;
	rule?: string[];
}

const mockHVACConfig: HVACConfig[] = [
	{
		name: 'On Grid',
		minTemperature: 20,
		maxTemperature: 50,
		unit: 'F',
		rule: ['On Grid'],
	},
	{
		name: 'Off Grid - On Solar',
		minTemperature: 20,
		maxTemperature: 56,
		unit: 'F',
		rule: ['Off Grid', 'On Solar'],
	},
	{
		name: 'Off Grid',
		minTemperature: 10,
		maxTemperature: 90,
		unit: 'F',
		rule: ['Off Grid', 'Off Solar'],
	},
];

const hvacData: HVACData = {
	dateTime: new Date(),
	status: true,
	temperature: 15,
	unit: 'F',
};

// Value must be between 0 and 100
// So it is in Celsius 
const marks: SliderMarks = {
	0: '32°F', // 0°C
	25: '77°F', // 25°C
	50: '122°F', // 50°C
	75: '167°F', // 75°C
	100: {
		style: {
			color: '#f50',
		},
		label: <strong>212°F</strong>, // 100°C
	},
};

const HVACWidget: React.FC<Widget> = () => {
	const [hvacConfig, setHVACConfig] = useState<HVACConfig[]>([]);
	useEffect(() => {
		// Make API call to get the config
		setHVACConfig(mockHVACConfig);
	}, []);

	return (
		<div className='group/internal hover:flex-grow text-lg px-2 flex flex-col p-4 bg-slate-50 rounded-md pointer-events-auto transition-all duration-300 ease-in-out transform hover:scale-101'>
			<div className='flex items-center justify-between w-full'>
				<img src={hvac} className='w-10 h-10' />
				<span className='mr-2 flex'>
					<p className='mr-8'>
						HVAC
					</p>
					<p>
						{hvacData?.temperature}°{hvacData?.unit}
					</p>
				</span>
			</div>
			<div className='h-0 opacity-0 group-hover/internal:h-auto group-hover/internal:opacity-100 group-hover/internal:p-2 pointer-events-none group-hover/internal:pointer-events-auto'>
				<div className='border-t border-black h-0.5 my-2' />
				<div className='flex flex-row h-auto w-full justify-evenly'>
					<div className='flex flex-col h-full w-full text-sm'>
						{
							hvacConfig.map((config, index) => {
								return (
									<div key={index} className='shadow-sm p-1 flex flex-col'>
										<div>
											{config.name}
										</div>
										<Slider
											range
											marks={marks}
											tooltip={{
												formatter: (value?: number) => {
													if (value === undefined) {
														return '';
													}
													// Calculate the Fahrenheit temperature for the current value
													const fahrenheit = value * 9 / 5 + 32;
													return `${fahrenheit}°F`;
												}
											}}
											value={[config.minTemperature, config.maxTemperature]}
											onChange={(value: number[]) => {
												setHVACConfig(prevState => {
													const newState = [...prevState];
													newState[index].minTemperature = value[0];
													newState[index].maxTemperature = value[1];
													return newState;
												});
											}}
											onAfterChange={(value) => console.log(value)}
										/>
									</div>
								);
							})
						}
					</div>
				</div>
			</div>
		</div>
	);
};

export default HVACWidget;
