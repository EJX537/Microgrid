import { EllipsisOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import { Button } from 'antd';

const DemoPie = () => {
  const data = [
    {
      type: 'Running',
      value: 3,
      color: 'red'
    },
    {
      type: 'Warning',
      value: 1,
    },
    {
      type: 'Down',
      value: 0,
    },
  ];


  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    color: ['#1f77b4', '#ff7f0e', '#c7c7c7', ],
    radius: 0.8,
    label: {
      type: 'outer',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };
  return (
    <div className='flex flex-col'>
      <div className='flex flex-row items-center justify-between'>
        <span className='text-xl font-mono font-bold'>
          Running Devices
        </span>
        <Button>
          <EllipsisOutlined />
        </Button>
      </div>
      <Pie {...config} />
      <span className='absolute bottom-10 text-red-600 text-lg font-bold'>
        Device 1 is not detected!
      </span>
    </div>
  );
};

export default DemoPie;
