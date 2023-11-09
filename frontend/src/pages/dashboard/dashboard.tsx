import WeatherWidget from '../../components/widget/weather';
import { DashboardLayout, WidgetLayout } from '../../layouts';
import ChartCarousel from './chartCarousel';
import EnergyUsage from '../../components/charts/powerVue/energyGeneration/energyGeneration';
import { Widget, WidgetComponent } from '../../interfaces/JSXTypes';
import { BatteryChart } from '../../components';
import { useState } from 'react';
import { BatteryChartConfig } from '../../interfaces/configurationTypes';

const dashboardConfig = {
	chartCarouselConfigs: {},
	batteryChartConfigs: {
		warning: 0.4,
		danger: 0.2,
		animationSpeed: 4000,
	} as BatteryChartConfig,
	energyUsageConfigs: {},
};

// Dashboard is grid composed of 12 columns.
const Dashboard = () => {
	const widgets: React.ReactElement<Widget, WidgetComponent>[] = [
		<WeatherWidget />,
		<WeatherWidget />,
		<WeatherWidget />,
	];
	const [config, setConfig] = useState(dashboardConfig);
	return (
		<DashboardLayout>
			<ChartCarousel />
			<div className='rounded-lg col-start-1 xl:col-span-5 col-span-6 p-4 flex flex-col shadow-sm group'>
				<BatteryChart config={config.batteryChartConfigs} setConfig={setConfig}/>
			</div>
			<WidgetLayout widgets={widgets} className='xl:col-start-6 col-start-7 col-span-full' />
			<div className='rounded-lg col-start-1 col-span-full h-full w-full shadow-sm'>
				<EnergyUsage />
			</div>
		</DashboardLayout>
	);
};

export default Dashboard;
