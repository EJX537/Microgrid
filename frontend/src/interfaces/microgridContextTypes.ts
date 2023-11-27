import React, { Dispatch, ReactNode } from 'react';
import { BatteryChartConfig, EnergyGenerationConfig, eGaugeConfig } from './configurationTypes';

interface WindowSize {
	width: number;
	height: number;
}

export interface MicrogridState {
	user: string;
	setUser: Dispatch<React.SetStateAction<string>>;
	collapsed: boolean;
	toggleCollapsed: () => void;
	windowSize: WindowSize;
	config: {
		chartCarouselConfigs: eGaugeConfig[];
		batteryChartConfigs: BatteryChartConfig;
		energyUsageConfigs: EnergyGenerationConfig;
	};
	setConfig: React.Dispatch<React.SetStateAction<{
		chartCarouselConfigs: eGaugeConfig[];
		batteryChartConfigs: BatteryChartConfig;
		energyUsageConfigs: EnergyGenerationConfig;
	}>>;
}

export interface ProviderProps {
	children: ReactNode;
}
