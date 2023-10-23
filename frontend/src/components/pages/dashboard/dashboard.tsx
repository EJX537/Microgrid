import { Card } from 'antd';
import ExampleGraph from '../../sampleGraph';
import DemoPie from '../../sampleGraph2';

const Dashboard = () => {
  return (
    <div className='p-4 pt-6 h-fit grid grid-cols-12 gap-2'>
      <div className='bg-gray-200 rounded-md h-14 items-center flex pl-4 col-start-1 col-span-full'>
        Filter
      </div>

      <Card className='bg-gray-400 w-full h-48 rounded-md p-2 col-start-1 col-span-full'>
      </Card>

      <Card className='bg-gray-200 rounded-lg col-start-1 col-span-7'>
        <ExampleGraph />
      </Card>

      <Card className='bg-gray-200 rounded-lg col-start-8 col-span-full h-full w-full'>
        <DemoPie />
      </Card>

      <Card className=' bg-gray-200 rounded-lg col-start-1 col-span-full'>
        <ExampleGraph />
      </Card>
    </div>
  );
};

export default Dashboard;
