import { Carousel } from 'antd';
import EnergyGenerationChart from '../../components/charts/powerVue/eneryGeneration/energyGenerationChart';
import { useEffect, useState, useRef } from 'react';
import PanelChart from '../../components/charts/eGauge/panelChart';
import EnergyUsage from '../../components/charts/powerVue/energyGeneration';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { useMicrogrid } from '../../context/useMicrogridContext';
import { weatherIcons, waterTank, hvac } from './svgImports';

const charts = [
	<div key='1' className='h-[346px] w-[380px] bg-white rounded-md p-2 flex flex-col group'>
		<div className='h-auto px-2 text-base font-mediums flex justify-between mb-2 items-center'>
			<span>
				Kitchen
			</span>
			<button className='transition-opacity opacity-0 group-hover:opacity-100'>
				<SettingOutlined />
			</button>
		</div>
		<PanelChart source='http://localhost:8080/time' />
	</div>,
	<div key='2' className='h-[346px] w-[380px] bg-white rounded-md p-2 flex flex-col group'>
		<div className='h-auto px-2 text-base font-mediums flex justify-between mb-2 items-center'>
			<span>
				HVAC
			</span>
			<button className='transition-opacity opacity-0 group-hover:opacity-100'>
				<SettingOutlined />
			</button>
		</div>
	</div>,
	<div key='3' className='h-[346px] w-[380px] bg-white rounded-md p-2 flex flex-col group'>
		<div className='h-auto px-2 text-base font-mediums flex justify-between mb-2 items-center'>
			<span>
				H2O
			</span>
			<button className='transition-opacity opacity-0 group-hover:opacity-100'>
				<SettingOutlined />
			</button>
		</div>
	</div>,
];

const Dashboard = () => {
	const [divs, setDivs] = useState<JSX.Element[]>([]);
	const carouselRef = useRef<HTMLDivElement>(null);
	const { windowSize } = useMicrogrid();
	useEffect(() => {
		if (carouselRef.current) {
			let noPlus = false;
			const newDivArray: JSX.Element[] = [];
			const divsPerSlide = (Math.floor(carouselRef.current.offsetWidth / 386));
			for (let i = 0; i < charts.length; i += divsPerSlide) {
				let divsInThisSlide = charts.slice(i, i + divsPerSlide);
				if (divsInThisSlide.length < divsPerSlide) {
					const fillerDivs = Array.from({ length: divsPerSlide - divsInThisSlide.length }, (_, index) => <div key={`filler-${index}`} className='h-[346px] w-[380px] flex justify-center items-center'> <button className='h-16 w-16 bg-white rounded-full'><PlusOutlined /></button> </div>);
					divsInThisSlide = [...divsInThisSlide, ...fillerDivs];
					noPlus = true;
				}
				newDivArray.push(<div key={`slide-${i}`} className='h-[358px] !flex flex-row justify-evenly p-2 pt-3'>{divsInThisSlide}</div>);
			}
			if (!noPlus) {
				let divsInThisSlide: JSX.Element[] = [];
				for (let i = 0; i < charts.length; i += divsPerSlide) {
					const fillerDivs = Array.from({ length: divsPerSlide - divsInThisSlide.length }, (_, index) => <div key={`filler-${index}`} className='h-[346px] w-[380px] flex justify-center items-center'> <button className='h-16 w-16 bg-white rounded-full'><PlusOutlined /></button> </div>);
					divsInThisSlide = [...divsInThisSlide, ...fillerDivs];
				}
				newDivArray.push(<div key={`slide-${2}`} className='h-[358px] !flex flex-row justify-evenly p-2 pt-3'>{divsInThisSlide}</div>);
			}
			setDivs(newDivArray);
		}
	}, [windowSize.width]);

	return (
		<div className='p-4 pt-6 h-full grid grid-cols-12 gap-2 w-full'>
			<div className='rounded-md h-10 items-center flex pl-4 col-start-1 col-span-full justify-evenly shadow-sm p-2'>
				<span>
					Filter:
				</span>
				<button>
					Simple view
				</button>
				<button>
					Advanced view
				</button>
			</div>
			<div className='h-96 w-full col-start-1 col-span-full bg-gray-200 rounded-md shadow-sm' ref={carouselRef}>
				<div className='w-full h-full'>
					<div className='carousel-parent'>
						<Carousel className='w-full h-96 grid'>
							{divs.map((divElement) => divElement)}
						</Carousel>
					</div>
				</div>
			</div>

			<div className='rounded-lg col-start-1 xl:col-span-5 col-span-6 p-4 flex flex-col shadow-sm group'>
				<div className='text-lg px-2 justify-between flex'>
					<span>
						Solar & Battery Status
					</span>
					<button className='transition-opacity opacity-0 group-hover:opacity-100'>
						<SettingOutlined />
					</button>
				</div>
				<div className='border-t border-black h-0.5 my-2' />
				<EnergyGenerationChart />
			</div>

			<div className='rounded-lg xl:col-start-6 col-start-7 col-span-full shadow-sm flex flex-col p-4 justify-evenly pointer-events-none transition-all duration-300 ease-in-out transform hover:scale-105 group'>
				<div className='text-lg px-2 justify-between flex items-center p-4 bg-slate-50 rounded-md pointer-events-auto hover:flex-grow hover:items-start transition-all duration-300 ease-in-out transform hover:scale-100 hover:bg-slate-200'>
					<img src={weatherIcons['sunny']} className='rounded-full h-10 w-10 flex items-center justify-center' />
					<span>
						20°
					</span>
				</div>
				<div className='text-lg px-2 justify-between flex items-center p-4 bg-slate-50 rounded-md pointer-events-auto hover:flex-grow hover:items-start transition-all duration-300 ease-in-out transform hover:scale-100 hover:bg-slate-200'>
					<img src={waterTank} className='rounded-full h-10 w-10 flex items-center justify-center' />
					<span>
						78C°
					</span>
				</div>
				<div className='text-lg px-2 justify-between flex items-center p-4 bg-slate-50 rounded-md pointer-events-auto hover:flex-grow hover:items-start transition-all duration-300 ease-in-out transform hover:scale-100 hover:bg-slate-200'>
					<img src={hvac} className='h-10 w-10 flex items-center justify-center' />
					<span className='pr-4'>
						On
					</span>
				</div>
			</div>

			<div className='rounded-lg col-start-1 col-span-full h-full w-full shadow-sm'>
				<EnergyUsage />
			</div>
		</div>
	);
};

export default Dashboard;

