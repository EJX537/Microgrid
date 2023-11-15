import { useEffect, useRef, useState } from 'react';
import { Widget } from '../../interfaces/JSXTypes';
import { weatherIcons } from './svgImports';

interface WeatherData {
	detailedForecast: string;
	dewpoint: {
		unitCode: string;
		value: number;
	};
	endTime: string;
	icon: string;
	isDaytime: boolean;
	name: string;
	number: number;
	probabilityOfPrecipitation: {
		unitCode: string;
		value: number | null;
	};
	relativeHumidity: {
		unitCode: string;
		value: number;
	};
	shortForecast: string;
	startTime: string;
	temperature: number;
	temperatureTrend: null;
	temperatureUnit: string;
	windDirection: string;
	windSpeed: string;
}

const WeatherWidget: React.FC<Widget> = () => {
	const [weatherData, setWeatherData] = useState([] as WeatherData[]);
	const parentRef = useRef<HTMLDivElement>(null);
	const [itemsCount, setItemsCount] = useState(0);

	useEffect(() => {
		fetch('https://api.weather.gov/gridpoints/MTR/93,67/forecast')
			.then(response => response.json())
			.then(data => setWeatherData(data.properties.periods));
	}, []);

	useEffect(() => {
		if (weatherData.length !== 0 && parentRef && parentRef.current) {
			const parentWidth = parentRef.current.offsetWidth;
			const itemWidth = 100; // replace with the width of a single item
			setItemsCount(Math.floor(parentWidth / itemWidth));
		}
	}, [weatherData, parentRef.current?.offsetWidth]);

	return (
		<div className='group/internal text-lg px-2 flex flex-col p-4 bg-slate-50 rounded-md pointer-events-auto transition-all duration-300 ease-in-out transform hover:scale-101'>
			<div className='flex items-center justify-between w-full'>
				<img src={weatherIcons[weatherData[0]?.isDaytime ? 'sunny' : 'night']} className='w-10 h-10' />
				<span className='mr-2 flex'>
					<p className='mr-8'>
						{weatherData[0]?.shortForecast}
					</p>
					<p>
						{weatherData[0]?.temperature}°F
					</p>
				</span>
			</div>
			<div className='h-0 opacity-0 group-hover/internal:h-auto group-hover/internal:opacity-100 group-hover/internal:p-2 pointer-events-none group-hover/internal:pointer-events-auto'>
				<div className='border-t border-black h-0.5 my-2' />
				<div className='flex flex-row h-auto w-full justify-evenly' ref={parentRef}>
					{weatherData.splice(1, itemsCount * 2).filter((_, index) => index % 2 === 0).map((data, index) => (
						<div key={index} className='flex flex-col max-h-[136px] overflow-hidden  justify-center h-full items-center text-center w-20 text-sm'>
							<img src={data.icon} className='h-20 w-20' />
							<p>
								{new Date(data.startTime).toLocaleDateString('en-US', { weekday: 'long' })}
							</p>
							<p>
								{data.temperature}°F
							</p>
							<p className='text-xs'>
								{data.shortForecast}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default WeatherWidget;




