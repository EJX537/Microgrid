import { Widget } from '../../interfaces/JSXTypes';

const WeatherWidget: React.FC<Widget> = () => {
	return (
		<div className='group/internal text-lg px-2 flex flex-col p-4 bg-slate-50 rounded-md pointer-events-auto hover:flex-grow transition-all duration-300 ease-in-out transform hover:bg-slate-200'>
			<div className=''>
				Weather
			</div>
			<div className='h-0 opacity-0 group-hove/internal:h-auto group-hover/internal:opacity-100 transition-all duration-300 ease-in-out'>
				<div className='border-t border-black h-0.5 my-2' />
				<div>
					Extra Stuff
				</div>
			</div>
		</div>
	);
};

export default WeatherWidget;




