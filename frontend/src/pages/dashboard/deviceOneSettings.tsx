
import { Switch, Select, Space, Typography } from 'antd';
const { Title } = Typography;
const handleChange = (value: string) => {
	console.log(`selected ${value}`);
};


//https://ant.design/components/select
const DeviceOneSettings: React.FC = () => (
	<Space wrap>
		<Title level={5}>Choose data refresh rate</Title>
		<Select
			defaultValue="Choose how often you would like to refresh the data feed"
			style={{ width: 120 }}
			onChange={handleChange}
			options={[
				{ value: '1', label: '1 seconds' },
				{ value: '2', label: '2 seconds' },
				{ value: '3', label: '3 seconds' },
				{ value: '4', label: '4 seconds', },
			]}
		/>
		<Title level={5}>Start/Stop Tracking This Device</Title>
		<Switch></Switch>
		{/* <Select
      defaultValue="lucy"
      style={{ width: 120 }}
      disabled
      options={[{ value: 'lucy', label: 'Lucy' }]}
    />
    <Select
      defaultValue="lucy"
      style={{ width: 120 }}
      loading
      options={[{ value: 'lucy', label: 'Lucy' }]}
    />
    <Select
      defaultValue="lucy"
      style={{ width: 120 }}
      allowClear
      options={[{ value: 'lucy', label: 'Lucy' }]}
    /> */}
	</Space>

);

export default DeviceOneSettings;
