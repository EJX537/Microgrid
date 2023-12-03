import React, { createContext, useEffect, useState } from 'react';
import { MicrogridState, ProviderProps } from '../interfaces/microgridContextTypes';
import { BatteryChartConfig, EnergyGenerationConfig, eGaugeConfig } from '../interfaces/configurationTypes';

export const MicrogridContext = createContext<MicrogridState | undefined>(undefined);

const dashboardConfigMock = {
	chartCarouselConfigs: [
		{
			name: 'Kitchen',
			source: 'S7_L1',
			period: '30 seconds',
		} as eGaugeConfig,
		{
			name: 'HVAC',
			source: 'S3_L1',
			period: '30 seconds',
		} as eGaugeConfig,
		{
			name: 'WATER',
			source: 'S5_L1',
			period: '1 minute',
		} as eGaugeConfig,
	],
	batteryChartConfigs: {
		warning: 0.4,
		danger: 0.2,
		animationSpeed: 4000,
	} as BatteryChartConfig,
	energyUsageConfigs: {} as EnergyGenerationConfig,
};

const MicrogridProvider: React.FC<ProviderProps> = ({ children }) => {
	const [user, setUser] = useState('root');
	const [config, setConfig] = useState(dashboardConfigMock);
	const [collapsed, setCollapsed] = useState(JSON.parse(localStorage.getItem('collapsed') ?? 'false'));
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	const toggleCollapsed = () => {
		setCollapsed(!collapsed);
		localStorage.setItem('collapsed', JSON.stringify(!collapsed));
	};

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);


	return (
		<MicrogridContext.Provider
			value={{ user, setUser, collapsed, toggleCollapsed, windowSize, config, setConfig }}>
			{children}
		</MicrogridContext.Provider>
	);
};

export default MicrogridProvider;
