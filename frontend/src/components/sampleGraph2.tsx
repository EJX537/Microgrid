import { EllipsisOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import { Button } from 'antd';

interface Datum {
  type: string;
  value: number;
}

const DemoPie = () => {
  const data = [
    {
      type: 'Running',
      value: 3,
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
    color: (datum: Datum) => {
      switch (datum.type) {
        case 'Running':
          return '#1f77b4'; // blue
        case 'Warning':
          return '#ff7f0e'; // orange
        case 'Down':
          return '#c7c7c7'; // green
        default:
          return '#c7c7c7'; // gray
      }
    },
    radius: 1,
    innerRadius: 0.7,
    label: {
      type: 'inner',
      offset: '-50%',
      style: {
        textAlign: 'center',
        fontSize: 0,
      },
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: '',
      },
    },
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
