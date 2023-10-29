import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface DataTypeWattHour {
  date: Date;
  watt: number;
}

interface DataTypePercentHour {
  date: Date;
  percent: number;
}

const date = new Date();
date.setHours(0, 0, 0, 0);
const dateTime: Date[] = [date];
for (let i = 1; i < 18; i++) {
  const time = new Date(date.getTime());
  time.setHours(i);
  dateTime.push(time);
}

const data1: DataTypeWattHour[] = dateTime.map((entry) => ({
  date: entry, watt: Math.floor(Math.random() * 11001) - 3000
}));


const data2: DataTypePercentHour[] = dateTime.map((entry) => ({
  date: entry, percent: Math.floor(Math.random() * 101)
}));

const DualYAxisAreaChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);

  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 20;
  const marginLeft = 30;

  useEffect(() => {
    if (!svgRef.current || !parentRef.current) {
      return;
    }
    const width = parentRef.current.offsetWidth;
    const height = parentRef.current.offsetHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height].join(' '))
      .attr('style', 'max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;');

    // Declare the x (horizontal position) scale.
    const x = d3.scaleUtc()
      .domain(d3.extent(dateTime, d => d) as [Date, Date])
      .range([marginLeft, width - marginRight]);

    const yMax = Math.ceil((d3.max(data1, d => d.watt) ?? 0) / 2000) * 2000;
    const yMin = Math.floor((d3.min(data1, d => d.watt) ?? 0) / 2000) * 2000;

    // Declare the y (vertical position) scale.
    const y1 = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height - marginBottom, marginTop]);

    // Declare the y (vertical position) scale.
    const y2 = d3.scaleLinear()
      .domain([0, 100])
      .range([height - marginBottom, marginTop]);

    // Create an area generator for data1
    const area1 = d3.area<DataTypeWattHour>()
      .x(d => x(d.date))
      .y0(y1(0))
      .y1(d => y1(d.watt));

    // Append data1 area to the SVG
    svg.append('path')
      .datum(data1)
      .attr('fill', 'steelblue')
      .attr('d', area1);


    // Create a line generator for data2
    const line2 = d3.line<DataTypePercentHour>()
      .x(d => x(d.date))
      .y(d => y2(d.percent));

    // Append data2 line to the SVG
    svg.append('path')
      .datum(data2)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 1.5)
      .attr('d', line2);

    // Add the x-axis.
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => {
        if (d instanceof Date) {
          return d3.timeFormat('%H:%M')(d);
        } else {
          return d.toString();
        }
      }).tickSize(0))
      .classed('hide-axis', true);

    // Add the y-axis.
    svg.append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y1).ticks(Math.ceil((yMax - yMin) / 2000)).tickSize(0)) // Adjust ticks here
      .call(g => g.select('.domain').remove())
      .call(g => g.append('text')
        .attr('x', -marginLeft)
        .attr('y', 5)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'start')
        .text('(W)'));

    // Add the y-axis 2.
    svg.append('g')
      .attr('transform', `translate(${width - marginRight},0)`)
      .call(d3.axisRight(y2).ticks(Math.ceil((yMax - yMin) / 2000)).tickSize(0))
      .call(g => g.select('.domain').remove())
      .call(g => g.append('text')
        .attr('y', 5)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'start')
        .text('(%)'));



    // For each tick...
    y1.ticks(Math.ceil((yMax - yMin) / 2000)).forEach(tickValue => {
      // Append a line to the SVG
      svg.append('line')
        .style('stroke', 'darkblue') // Set the line color
        .style('stroke-width', 0.5) // Set the line width
        .attr('x1', marginLeft) // Set the starting x-coordinate
        .attr('x2', width - marginRight) // Set the ending x-coordinate
        .attr('y1', y1(tickValue)) // Set the starting and ending y-coordinate
        .attr('y2', y1(tickValue));
    });


    // Add a horizontal line at y=0.
    svg.append('line')
      .style('stroke', 'black')
      .style('stroke-width', 1)
      .attr('x1', marginLeft)
      .attr('x2', width - marginRight)
      .attr('y1', y1(0))
      .attr('y2', y1(0));

  }, [svgRef]);



  // Return the SVG element.
  return (
    <div className='h-full w-full p-2' ref={parentRef}>
      <svg ref={svgRef} />
    </div>
  );
};

export default DualYAxisAreaChart;
