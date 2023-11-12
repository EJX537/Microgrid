import { Carousel } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import PanelChart from '../../components/charts/eGauge/panelChart';
import { useMicrogrid } from '../../context/useMicrogridContext';

interface ChartCarouselProps {
	height?: number;
	width?: number;
}

const ChartCarousel: React.FC<ChartCarouselProps> = ({ height = 300, width = 330 }) => {
	const [divs, setDivs] = useState<JSX.Element[]>([]);
	const carouselRef = useRef<HTMLDivElement>(null);
	const resizeObserver = useRef<ResizeObserver | undefined>(undefined);
	const [carouselWidth, setCarouselWidth] = useState(0);
	const { config } = useMicrogrid();
	const updateSize = () => {
		if (carouselRef.current) {
			setCarouselWidth(carouselRef.current.offsetWidth);
		}
	};

	useEffect(() => {
		const currentCarouselRef = carouselRef.current;
		resizeObserver.current = new ResizeObserver(updateSize);
		if (currentCarouselRef) {
			resizeObserver.current.observe(currentCarouselRef);
		}
		return () => {
			if (resizeObserver.current && currentCarouselRef) {
				resizeObserver.current.unobserve(currentCarouselRef);
			}
		};
	}, []);

	useEffect(() => {
		if (carouselRef.current) {
			const heightWithGap = height + 16;
			const widthWithGap = width + 5;
			let noPlus = false;
			const newDivArray: JSX.Element[] = [];
			const divsPerSlide = Math.max(1, Math.floor(carouselWidth / widthWithGap));

			const configKeys = Object.keys(config.chartCarouselConfigs);
			let divsInThisSlide: JSX.Element[] = [];
			configKeys.forEach((key, index) => {
				divsInThisSlide.push(<PanelChart key={index} name={key} />);
				if (divsInThisSlide.length === divsPerSlide) {
					newDivArray.push(<div key={`slide-${index}`} className='h-[316px] !flex flex-row justify-evenly p-2 pt-3'>{divsInThisSlide}</div>);
					divsInThisSlide = [];
				}
			});
			if (divsInThisSlide.length > 0) {
				const fillerCount = divsPerSlide - divsInThisSlide.length;
				if (fillerCount > 0) {
					const fillerDivs = Array.from({ length: fillerCount }, (_, index) =>
						<div key={`filler-${index}`} className='h-[300px] w-[330px] flex justify-center items-center group'>
							<button className='h-16 w-16 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out'><PlusOutlined /></button>
						</div>
					);
					divsInThisSlide = [...divsInThisSlide, ...fillerDivs];
					noPlus = true;
				}
				newDivArray.push(<div key={`slide-${configKeys.length}`} className='h-[316px] !flex flex-row justify-evenly p-2 pt-3'>{divsInThisSlide}</div>);
			}

			if (!noPlus) {
				let divsInThisSlide: JSX.Element[] = [];
				for (let i = 0; i < divsPerSlide; i++) {
					const fillerDivs = Array.from({ length: divsPerSlide - divsInThisSlide.length }, (_, index) => <div key={`filler-${index}`} className='h-[300px] w-[330px] flex justify-center items-center'> <button className='h-16 w-16 bg-white rounded-full'><PlusOutlined /></button> </div>);
					divsInThisSlide = [...divsInThisSlide, ...fillerDivs];
				}
				newDivArray.push(<div key={`slide-${2}`} className={`h-[${heightWithGap}px] !flex flex-row justify-evenly p-2 pt-3`}>{divsInThisSlide}</div>);
			}
			setDivs(newDivArray);
		}
	}, [carouselWidth, config, height, width]);

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

