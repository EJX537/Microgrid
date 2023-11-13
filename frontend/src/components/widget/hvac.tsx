import { Widget } from '../../interfaces/JSXTypes';
import { hvac } from './svgImports';

interface HVACData {
	dateTime: Date;
	status: boolean;
	temperature: number;
	unit: string;
	metaData?: []
}

const hvacData: HVACData = {
	dateTime: new Date(),
	status: true,
	temperature: 15,
	unit: 'F',
};

const HVACWidget: React.FC<Widget> = () => {
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
					<div className='flex flex-col justify-center h-full items-center text-center w-20 text-sm'>
						<p>
							1
						</p>
						<p>
							2
						</p>
						<p>
							3
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HVACWidget;
