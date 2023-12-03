import { eGaugeData, requestBetweenPeriods } from './eGaugeTypes';

const onLoadRequestConfig = () => {

};

const onloadRequest = (props: requestBetweenPeriods): eGaugeData[] | Error => {
	const { source, startDate, endDate, target } = props;

	return [];
};

const readSSEResponse = (target: URL): EventSource => {
	const eventSource = new EventSource(target);
	eventSource.onerror = (event) => {
		console.error('Error with SSE connection', event);
		return eventSource.close();
	};

	return eventSource;
};

export { onloadRequest, readSSEResponse, onLoadRequestConfig };
