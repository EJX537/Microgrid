import { Carousel } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import PanelChart from './panelChart';
import { useMicrogrid } from '../../../context/useMicrogridContext';
import { readSSEResponse } from './eGaugeDataRequester';
import { Config, eGaugeData, eGaugeDataStream } from './eGaugeTypes';

interface ChartCarouselProps {
	height?: number;
	width?: number;
}

interface eGaugePannel {
	config: Config;
	data: eGaugeData[];
}

const PADDINGY = 16;
const PADDINGX = 5;

const ChartCarousel: React.FC<ChartCarouselProps> = ({ height = 300, width = 330 }) => {
	const [divs, setDivs] = useState<JSX.Element[]>([]);
	const carouselRef = useRef<HTMLDivElement>(null);
	const resizeObserver = useRef<ResizeObserver | undefined>(undefined);
	const [carouselWidth, setCarouselWidth] = useState(0);
	const { config } = useMicrogrid();
	const eventSourceRef = useRef<EventSource | null>(null);

	const [eGaugeInfo, seteGaugeInfo] = useState<eGaugePannel[]>(
		config.chartCarouselConfigs.map((eGaugeConfig: Config) => {
			return { config: eGaugeConfig, data: [] as eGaugeData[] };
		}));

	const [eGaugeSources] = useState(
		config.chartCarouselConfigs.map((eGaugeConfig: Config) => {
			return eGaugeConfig.source;
		})
	);

	const updateSize = () => {
		if (carouselRef.current) {
			setCarouselWidth(carouselRef.current.offsetWidth);
		}
	};

	const firstLoadData = async (time: string, source: string) => {
		try {
			const response = await fetch(`http://localhost:8080/egaugetime?time=${time}&dataname=${source}`);
			const data = await response.json();
			console.log(data);
			return data;
		} catch (error) {
			return [];
		}
	};

	// Make sure that the carousel is dependent on the size of the screen and its parent
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

	// useEffect(() => {
	// 	eGaugeSources.forEach((source) => {
	// 		const eGaugeInstance = eGaugeInfo.find((eGaugeInstance) => eGaugeInstance.config.source === source);
	// 		if (!eGaugeInstance) return;
	// 		firstLoadData(eGaugeInstance.config.period, eGaugeInstance.config.source).then((data) => {
	// 			seteGaugeInfo((prevInfo) => {
	// 				const updatedInfo = prevInfo.map((eGaugeInstance) => {
	// 					if (eGaugeInstance.config.source === source) {
	// 						return {
	// 							...eGaugeInstance,
	// 							data: [...eGaugeInstance.data, data]
	// 						};
	// 					}
	// 					return eGaugeInstance;
	// 				});
	// 				return updatedInfo;
	// 			});
	// 		});
	// 	});
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [eGaugeSources]);


	useEffect(() => {
		// Only create a new EventSource if one doesn't already exist
		if (!eventSourceRef.current) {
			eventSourceRef.current = readSSEResponse(new URL('http://localhost:8080/egauge'));
			eventSourceRef.current.onmessage = (event) => {
				const parsedData: eGaugeDataStream = JSON.parse(event.data);
				const dateTime = new Date(parsedData.dateTime);
				eGaugeSources.forEach((source) => {
					const matchingEGaugeInstance = eGaugeInfo.find((eGaugeInstance) => eGaugeInstance.config.source === source);
					const dataEntry = parsedData[source];
					if (matchingEGaugeInstance) {
						const data = {
							dateTime: dateTime,
							value: dataEntry as number,
							unit: 'W'
						};
						seteGaugeInfo((prevInfo) => {
							const updatedInfo = prevInfo.map((eGaugeInstance) => {
								if (eGaugeInstance.config.source === source) {
									return {
										...eGaugeInstance,
										data: [...eGaugeInstance.data, data]
									};
								}
								return eGaugeInstance;
							});
							return updatedInfo;
						});
					}
				});
			};
		}

		// Clean up the EventSource when the component is unmounted
		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}
		};
	}, [eGaugeInfo, eGaugeSources]); // Empty dependency array so the useEffect only runs once

	useEffect(() => {
		if (carouselRef.current) {
			const heightWithGap = height + PADDINGY;
			const widthWithGap = width + PADDINGX;
			const noPlus = true; // False if you want to show the plus button on new slides
			const newDivArray: JSX.Element[] = [];
			const divsPerSlide = Math.max(1, Math.floor(carouselWidth / widthWithGap));
			let divsInThisSlide: JSX.Element[] = [];
			eGaugeInfo.forEach((eGaugeInstance, index) => {
				divsInThisSlide.push(<PanelChart key={index} index={index} dataSet={eGaugeInstance.data} />);
				if (divsInThisSlide.length === divsPerSlide) {
					newDivArray.push(<div key={`slide-${index}`} className={`h-[${heightWithGap}px] !flex flex-row justify-evenly p-2 pt-3`}>{divsInThisSlide}</div>);
					divsInThisSlide = [];
				}
			});

			if (divsInThisSlide.length > 0) {
				const fillerCount = divsPerSlide - divsInThisSlide.length;
				if (fillerCount > 0) {
					const fillerDivs = Array.from({ length: fillerCount }, (_, index) =>
						<div key={`filler-${index}`} className={`h-[${height}px] w-[${width}px] flex justify-center items-center group`}>
							<button className='h-16 w-16 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out'><PlusOutlined /></button>
						</div>
					);
					divsInThisSlide = [...divsInThisSlide, ...fillerDivs];
					// noPlus = true;
				}
				newDivArray.push(<div key={`slide-${eGaugeInfo.length}`} className={`h-[${heightWithGap}px] !flex flex-row justify-evenly p-2 pt-3`}>{divsInThisSlide}</div>);
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
	}, [carouselWidth, eGaugeInfo, height, width]);

	return (
		<div className='h-[360px] w-full col-start-1 col-span-full bg-gray-200 rounded-md shadow-sm py-2' ref={carouselRef}>
			<div className='w-full h-full'>
				<div className='carousel-parent'>
					<Carousel className={`w-full h-[${height + PADDINGY}px] sm:gap-1 gap-2`}>
						{divs.map((divElement) => divElement)}
					</Carousel>
				</div>
			</div>
		</div>
	);
};

export default ChartCarousel;
