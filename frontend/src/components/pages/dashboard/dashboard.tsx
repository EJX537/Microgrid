
import { Carousel } from 'antd';
import EnergyGenerationChart from '../../charts/eneryGeneration/energyGenerationChart';
import { useEffect, useState, useRef } from 'react';
import { useWindow } from '../../context/useWindowContext';
import PanelChart from '../../charts/eGauge/panelChart';
import EnergyUsage from './energyGeneration';

const charts = [
	<div key='1' className='h-[346px] w-[380px] bg-white rounded-md p-2 flex flex-col'>
		<div className='h-auto p-2 text-base font-mediums'>
			Kitchen
		</div>
		<PanelChart />
	</div>,
	<div key='2' className='h-[346px] w-[380px] bg-white rounded-md p-2'>H2O</div>,
	<div key='3' className='h-[346px] w-[380px] bg-white rounded-md p-2'>HVAC</div>,
];


const Dashboard = () => {
	const [divs, setDivs] = useState<JSX.Element[]>([]);
	const carouselRef = useRef<HTMLDivElement>(null);
	const { width, height } = useWindow();

	useEffect(() => {
		if (carouselRef.current) {
			const newDivArray: JSX.Element[] = [];
			const divsPerSlide = (Math.floor(carouselRef.current.offsetWidth / 386));
			for (let i = 0; i < charts.length; i += divsPerSlide) {
				let divsInThisSlide = charts.slice(i, i + divsPerSlide);
				if (divsInThisSlide.length < divsPerSlide) {
					const fillerDivs = Array.from({ length: divsPerSlide - divsInThisSlide.length }, (_, index) => <div key={`filler-${index}`} className='h-[216px] w-[380px]'></div>);
					divsInThisSlide = [...divsInThisSlide, ...fillerDivs];
				}
				newDivArray.push(<div key={`slide-${i}`} className='h-[358px] !flex flex-row justify-evenly p-2 pt-3'>{divsInThisSlide}</div>);
			}
			setDivs(newDivArray);
		}
	}, [width, height]);

	return (
		<div className='p-4 pt-6 h-full grid grid-cols-12 gap-2 w-full'>
			<div className='bg-gray-200 rounded-md h-14 items-center flex pl-4 col-start-1 col-span-full justify-evenly'>
				Filter:
				<button>
					Simple view
				</button>
				<button>
					Advanced view
				</button>
			</div>
			<div className='h-96 w-full col-start-1 col-span-full' ref={carouselRef}>
				<div className='bg-gray-400 w-full h-full rounded-md'>
					<div className='carousel-parent'>
						<Carousel className='w-full h-96 grid'>
							{divs.map((divElement) => divElement)}
						</Carousel>
					</div>
				</div>
			</div>

			<div className='rounded-lg col-start-1 col-span-7 p-4 flex flex-col'>
				<div className='text-lg pl-2'>
					Current Status
				</div>
				<div className='border-t border-black h-0.5 my-2' />
				<EnergyGenerationChart />
			</div>

			<div className='bg-gray-200 rounded-lg col-start-8 col-span-full'></div>

			<div className='bg-gray-50 rounded-lg col-start-1 col-span-full h-full w-full'>
				<EnergyUsage />
			</div>
		</div>
	);
};

export default Dashboard;

