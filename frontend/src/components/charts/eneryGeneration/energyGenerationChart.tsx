import { useEffect, useRef, useState } from 'react';
import EnergyGenerationSVG from './energyGenerationSVG';

export interface DataSteam {
	currentWatt: number;
}

interface DataRequest_Once {
	capacity: number;
	generatedToday: number;
	generatedMonth: number;
	generatedYear: number;
	generatedTotal: number;
}

const mockDataStream: DataSteam = {
	currentWatt: 3189,
};

const mockData: DataRequest_Once = {
	capacity: 5000,
	generatedToday: 4100,
	generatedMonth: 3369000,
	generatedYear: 3369000,
	generatedTotal: 3369000
};

const EnergyGenerationChart = () => {
	const parentRef = useRef<HTMLDivElement | null>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		if (parentRef.current) {
			setDimensions({
				width: parentRef.current.offsetWidth,
				height: parentRef.current.offsetHeight
			});
		}
	}, [parentRef]);

	return (
		<div className='w-full flex flex-col h-auto flex-grow'>
			<div className='px-2 pt-2 h-full max-h-[300px]' ref={parentRef}>
				<EnergyGenerationSVG data={mockDataStream} height={dimensions.height} width={dimensions.width} capacity={mockData.capacity}/>
			</div>
			<div className='px-2 flex justify-evenly'>
				<div className='flex items-center gap-2'>
					<div className='h-12 w-12 border rounded-full flex justify-center items-center'>
						icon
					</div>
					<div className='flex flex-col '>
						<span className='text-blue-300 text-lg'>
							5kWp
						</span>
						<span>
							Capacity
						</span>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<div className='h-12 w-12 border rounded-full flex justify-center items-center'>
						icon
					</div>
					<div className='flex flex-col'>
						<span className='text-yellow-300 text-lg'>
							$4.1
						</span>
						<span>
							Today Revenue
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EnergyGenerationChart;
