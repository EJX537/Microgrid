import PanelChart from '../../components/charts/eGauge/panelChart';


// Backend can only handle 6 charts at a time
const DataView = () => {
	return (
		<div className="w-full h-full flex flex-col p-4 justify-center">
			<div className='flex justify-evenly p-2 pt-3 flex-wrap'>
				<PanelChart name={'HVAC'} />
				<PanelChart name={'Kitchen'} />
				<PanelChart name={'HVAC'} />
				<PanelChart name={'Kitchen'} />
				<PanelChart name={'HVAC'} />
				<PanelChart name={'Kitchen'} />
			</div>
		</div>
	);
};

export default DataView;
