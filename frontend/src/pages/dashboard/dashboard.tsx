import WeatherWidget from '../../components/widget/weather';
import { WidgetLayout } from '../../layouts';
import ChartCarousel from '../../components/charts/eGauge/chartCarousel';
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
		<div className='h-full w-full flex flex-col p-4 gap-y-2'>
			<div className='flex flex-col shadow-sm p-2 bg-gray-200 rounded-lg'>
				<h1 className="w-full bg-yellow-400 p-2 mb-4 rounded-sm text-red-600">WORK IN PROGRESS</h1>
				<div>
					Recommendation:
				</div>
				<div>
					Body
				</div>
			</div>
			<div className='rounded-lg col-start-1 col-span-full shadow-sm bg-gray-200'>
				<ChartCarousel />
			</div>
			<div className='flex flex-row w-full gap-x-2'>
				<div className='p-4 shadow-sm group w-3/4 bg-gray-200 rounded-lg flex flex-col'>
					<BatteryChart />
				</div>
				<div className='w-full bg-gray-200 rounded-lg'>
					<WidgetLayout widgets={widgets} />
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
