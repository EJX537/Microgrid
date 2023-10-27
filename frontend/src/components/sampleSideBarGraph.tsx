// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// Ant Design Chart is a JS library, Ignore Type Errors Coming From it
import { Bar } from '@ant-design/plots';
import { useState } from 'react';

const DemoSideBar = () => {
  const [dateNow, setDateNow] = useState('12:02');
  const data = [
    {
      dateHour: '11:58',
      value: 38,
    },
    {
      dateHour: '11:59',
      value: 52,
    },
    {
      dateHour: '12:00',
      value: 61,
    },
    {
      dateHour: '12:01',
      value: 145,
    },
    {
      dateHour: '12:02',
      value: 48,
    },
  ];
  const config = {
    data,
    xField: 'value',
    yField: 'dateHour',
    color: ({ dateHour }) => {
      return dateHour === dateNow ? '#FAAD14' : '#5B8FF9';
    }
  };

  return <Bar {...config} />;
};
export default DemoSideBar;
