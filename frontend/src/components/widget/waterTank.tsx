import { useEffect, useState } from 'react';
import { Widget } from '../../interfaces/JSXTypes';
import { waterTank } from './svgImports';

interface WaterData {
	dateTime: Date;
	temperature: number;
	unit: string;
	metaData?: []
}

const mockWaterData: WaterData = {
	dateTime: new Date(),
	temperature: 20,
	unit: 'F',
};

const WaterTankWidget: React.FC<Widget> = () => {
	const [WaterData, SetWaterData] = useState<WaterData>();

	useEffect(() => {
		SetWaterData(mockWaterData);
	}, []);

	return (
		<div className='group/internal hover:flex-grow text-lg px-2 flex flex-col p-4 bg-slate-50 rounded-md pointer-events-auto transition-all duration-300 ease-in-out transform hover:scale-101'>
			<div className='flex items-center justify-between w-full'>
				<img src={waterTank} className='w-10 h-10' />
				<span className='mr-2 flex'>
					<p className='mr-8'>
						Water Tank
					</p>
					<p>
						{WaterData?.temperature}°{WaterData?.unit}
					</p>
				</span>
			</div>
			<div className='h-0 opacity-0 group-hover/internal:h-auto group-hover/internal:opacity-100 group-hover/internal:p-2 pointer-events-none group-hover/internal:pointer-events-auto'>
				<div className='border-t border-black h-0.5 my-2' />
				<div className='flex flex-row h-auto w-full justify-evenly'>
					<div className='flex flex-col h-full w-full text-sm overflow-y-scroll '>
						<div className='w-full shadow-sm p-1 flex flex-col'>
							<div>
								On Grid
							</div>
							<div>
								slider
							</div>
						</div>
						<div className='w-full shadow-sm p-1 flex flex-col'>
							<div>
								Off Grid
							</div>
							<div>
								slider
							</div>
						</div>
						<div className='w-full shadow-sm p-1 flex flex-col'>
							<div>
								Add rule
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WaterTankWidget;
