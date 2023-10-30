import { Card, Carousel } from 'antd';
import EnergyUsageChart from '../../charts/powerVue/energyChart';
import EnergyGenerationChart from '../../charts/eneryGeneratopn/energyGenerationChart';

const Dashboard = () => {
	const onChange = (currentSlide: number) => {
		console.log(currentSlide);
	};

	return (
		<div className='p-4 pt-6 h-full grid grid-cols-12 gap-2 w-full'>
			<div className='bg-gray-200 rounded-md h-14 items-center flex pl-4 col-start-1 col-span-full'>
				Filter
			</div>
			<div className='h-52 w-full col-start-1 col-span-full'>
				<div className='bg-gray-400 w-full h-full rounded-md'>
					<Carousel afterChange={onChange} className='w-full h-52 flex flex-row'>
						<div className='h-full w-full p-2'>
							<div className='flex flex-row gap-x-4 justify-evenly'>
								<div className='h-[176px] w-[300px] bg-white p-2 rounded-lg flex flex-col max-w-[300px]'>
									<span className=''>
										Panel A
									</span>
								</div>
								<div className='h-[176px] w-[300px] bg-white p-2 rounded-lg flex flex-row max-w-[300px]'>
									<div className='w-1/5'>
										Panel B
									</div>
									<div className='w-4/5 h-full'>
									</div>
								</div>
							</div>
						</div>
						<div className='h-full w-full p-2'>
							<div className='flex flex-row gap-x-4'>
								<div className='h-[176px] w-[300px] bg-white p-2 rounded-lg flex flex-col max-w-[300px]'>

								</div>
								<div className='h-[176px] w-[300px] bg-white p-2 rounded-lg flex flex-col max-w-[300px]'>
								</div>
							</div>
						</div>
					</Carousel>
				</div>
			</div>

			<div className='rounded-lg col-start-1 col-span-7 p-4'>
				<EnergyGenerationChart/>
			</div>

			<div className='bg-gray-200 rounded-lg col-start-8 col-span-full'>
			</div>

			<div className='bg-gray-50 rounded-lg col-start-1 col-span-full h-full w-full'>
				<EnergyUsageChart />
			</div>
		</div>
	);
};

export default Dashboard;
