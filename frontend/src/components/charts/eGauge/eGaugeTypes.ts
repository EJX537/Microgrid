interface requestBetweenPeriods {
	source: string;
	startDate: string;
	endDate: string;
	target?: URL;
}

interface eGaugeData {
	dateTime: Date;
	value: number;
	unit: string;
}

type eGaugeDataStream = {
	source: string;
	value: number;
	dataTime: Date;
	[name: string]: string | Date | number;
}

interface Config {
	name: string;
	period: string;
	source: string;
}

export type { requestBetweenPeriods, eGaugeData, eGaugeDataStream, Config };
