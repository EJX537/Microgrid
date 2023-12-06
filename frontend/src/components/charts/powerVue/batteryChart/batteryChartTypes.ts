interface DataStream {
	pac: number;
	toGrid: boolean;
	gridTo: boolean;
	soc: number;
	battPower: number;
	gridOrMeterPower: number;
}

interface DataRequest_Once {
	capacity: number;
}

interface Config {
	danger: number;
	warning: number;
	animationSpeed: number;
}

export type { DataStream, DataRequest_Once, Config };
