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


export type { requestBetweenPeriods, eGaugeData };
