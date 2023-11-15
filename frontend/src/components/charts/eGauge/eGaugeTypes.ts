interface requestBetweenPeriods {
	source: string;
	startDate: string;
	endDate: string;
	target?: URL;
}

interface eGaugeData {
	source: string;
	dateTime: Date;
	value: number;
	unit: string;
}

interface Config {
	period: string;
	source: string;
}

type ConfigMap = {
	[name: string]: Config;
};

export type { requestBetweenPeriods, eGaugeData, Config, ConfigMap };
