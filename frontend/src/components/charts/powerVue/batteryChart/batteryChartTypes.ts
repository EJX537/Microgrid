interface DataSteam {
	currentWatt: number;
	projectedWatt: number;
	onGrid: boolean;
}

interface DataRequest_Once {
	capacity: number;
}

interface Config {
	danger: number;
	warning: number;
	animationSpeed: number;
}

export type { DataSteam, DataRequest_Once, Config };
