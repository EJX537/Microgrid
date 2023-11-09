import { Carousel } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useMicrogrid } from '../../context/useMicrogridContext';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import PanelChart from '../../components/charts/eGauge/panelChart';

const charts = [
	<div key='1' className='h-[300px] w-[330px] bg-white rounded-md p-2 flex flex-col group'>
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
	<div key='2' className='h-[300px] w-[330px] bg-white rounded-md p-2 flex flex-col group'>
		<div className='h-auto px-2 text-base font-mediums flex justify-between mb-2 items-center'>
			<span>
				HVAC
			</span>
			<button className='transition-opacity opacity-0 group-hover:opacity-100'>
				<SettingOutlined />
			</button>
		</div>
	</div>,
	<div key='3' className='h-[300px] w-[330px] bg-white rounded-md p-2 flex flex-col group'>
		<div className='h-auto px-2 text-base font-mediums flex justify-between mb-2 items-center'>
			<span>
				H2O
			</span>
			<button className='transition-opacity opacity-0 group-hover:opacity-100'>
				<SettingOutlined />
			</button>
		</div>
	</div>,
	<div key='4' className='h-[300px] w-[330px] bg-white rounded-md p-2 flex flex-col group'>
		<div className='h-auto px-2 text-base font-mediums flex justify-between mb-2 items-center'>
			<span>
				Other
			</span>
			<button className='transition-opacity opacity-0 group-hover:opacity-100'>
				<SettingOutlined />
			</button>
		</div>
	</div>,
];

interface ChartCarouselProps {
	height?: number;
	width?: number;
}

const ChartCarousel: React.FC<ChartCarouselProps> = ({ height = 300, width = 330 }) => {
	const [divs, setDivs] = useState<JSX.Element[]>([]);
	const carouselRef = useRef<HTMLDivElement>(null);
	const { windowSize } = useMicrogrid();

	const widthWithGap = width + 5;
	const heightWithGap = height + 14;
	useEffect(() => {
		if (carouselRef.current) {
			let noPlus = false;
			const newDivArray: JSX.Element[] = [];
			const divsPerSlide = (Math.floor(carouselRef.current.offsetWidth / widthWithGap));
			for (let i = 0; i < charts.length; i += divsPerSlide) {
				let divsInThisSlide = charts.slice(i, i + divsPerSlide);
				if (divsInThisSlide.length < divsPerSlide) {
					const fillerDivs = Array.from({ length: divsPerSlide - divsInThisSlide.length }, (_, index) => <div key={`filler-${index}`} className='h-[346px] w-[380px] flex justify-center items-center'> <button className='h-16 w-16 bg-white rounded-full'><PlusOutlined /></button> </div>);
					divsInThisSlide = [...divsInThisSlide, ...fillerDivs];
					noPlus = true;
				}
				newDivArray.push(<div key={`slide-${i}`} className='h-[314px] !flex flex-row justify-evenly p-2 pt-3'>{divsInThisSlide}</div>);
			}
			if (!noPlus) {
				let divsInThisSlide: JSX.Element[] = [];
				for (let i = 0; i < charts.length; i += divsPerSlide) {
					const fillerDivs = Array.from({ length: divsPerSlide - divsInThisSlide.length }, (_, index) => <div key={`filler-${index}`} className='h-[346px] w-[380px] flex justify-center items-center'> <button className='h-16 w-16 bg-white rounded-full'><PlusOutlined /></button> </div>);
					divsInThisSlide = [...divsInThisSlide, ...fillerDivs];
				}
				newDivArray.push(<div key={`slide-${2}`} className={`h-[${heightWithGap}px] !flex flex-row justify-evenly p-2 pt-3`}>{divsInThisSlide}</div>);
			}
			setDivs(newDivArray);
		}
	}, [heightWithGap, widthWithGap, windowSize.width]);

	return (
		<div className='h-90 w-full col-start-1 col-span-full bg-gray-200 rounded-md shadow-sm py-2' ref={carouselRef}>
			<div className='w-full h-full'>
				<div className='carousel-parent'>
					<Carousel className='w-full h-[345px] sm:gap-1 gap-2'>
						{divs.map((divElement) => divElement)}
					</Carousel>
				</div>
			</div>
		</div>
	);
};

export default ChartCarousel;
