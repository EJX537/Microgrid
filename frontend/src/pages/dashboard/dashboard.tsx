import WeatherWidget from '../../components/widget/weather';
import { WidgetLayout } from '../../layouts';
import ChartCarousel from '../../components/charts/eGauge/chartCarousel';
import EnergyUsage from '../../components/charts/powerVue/energyGeneration/energyGeneration';
import { Widget, WidgetComponent } from '../../interfaces/JSXTypes';
import { BatteryChart } from '../../components';
import WaterTankWidget from '../../components/widget/waterTank';
import HVACWidget from '../../components/widget/hvac';

// Dashboard is grid composed of 12 columns.
const Dashboard = () => {
	const widgets: React.ReactElement<Widget, WidgetComponent>[] = [
		<WeatherWidget />,
		<WaterTankWidget />,
		<HVACWidget />,
	];
	return (
		<div className='p-4 h-full grid grid-cols-12 gap-2 w-full'>
			<ChartCarousel />
			<div className='rounded-lg col-start-1 xl:col-span-5 col-span-6 p-4 flex flex-col shadow-sm group'>
				<BatteryChart />
			</div>
			<WidgetLayout widgets={widgets} className='xl:col-start-6 col-start-7 col-span-full' />
			<div className='rounded-lg col-start-1 col-span-full shadow-sm'>
				<EnergyUsage />
			</div>
		</div>
	);
};

export default Dashboard;
