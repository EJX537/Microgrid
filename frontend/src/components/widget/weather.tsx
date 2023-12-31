import { useEffect, useRef, useState } from 'react';
import { Widget } from '../../interfaces/JSXTypes';
import { weatherIcons } from './svgImports';

interface WeatherData {
	detailedForecast: string;
	icon: string;
	id: number;
	name: string;
	number: number;
	probabilityOfPrecipitation: {
		unitCode: string;
		value: number | null;
	};
	shortForecast: string;
	startTime: string;
	temperature: number;
}

const WeatherWidget: React.FC<Widget> = () => {
	const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
	const parentRef = useRef<HTMLDivElement>(null);
	const [itemsCount, setItemsCount] = useState(0);

	useEffect(() => {
		fetch('http://localhost:8080/weather')
			.then(response => response.json())
			.then(data => setWeatherData(data));
	}, []);

	useEffect(() => {
		if (weatherData.length !== 0 && parentRef && parentRef.current) {
			const parentWidth = parentRef.current.offsetWidth;
			const itemWidth = 100; // replace with the width of a single item
			setItemsCount(Math.floor(parentWidth / itemWidth));
		}
	}, [weatherData, parentRef.current?.offsetWidth]);

	return (
		<div className='group/internal hover:flex-grow text-lg px-2 flex flex-col p-4 bg-slate-50 rounded-md pointer-events-auto transition-all duration-300 ease-in-out transform hover:scale-101'>
			<div className='flex items-center justify-between w-full'>
				<img src={weatherIcons[weatherData[0]?.shortForecast?.toLowerCase().includes('rain') ? 'sunny-rainy-medium' : 'sunny']} className='w-10 h-10' />
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
					{weatherData.splice(0, itemsCount * 2).filter((_, index) => index % 2 === 0).map((data, index) => (
						<div key={index} className='flex flex-col justify-center h-full items-center text-center w-20 text-sm'>
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




