import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useWindow } from '../../context/useWindowContext';

interface DataTypeWattHour {
	date: Date;
	source: string;
	watt: number;
}

interface DataTypePercentHour {
	date: Date;
	percent: number;
}

const date = new Date();
date.setHours(0, 0, 0, 0);
const dateTime: Date[] = [date];
for (let i = 1; i < 60; i++) {
	const time = new Date(date.getTime());
	time.setHours(i);
	dateTime.push(time);
}

const data1: DataTypeWattHour[] = dateTime.map((entry) => ({
	date: entry, watt: Math.floor(Math.random() * 11001) - 3000, source: 'eGuage'
}));

const data3: DataTypeWattHour[] = dateTime.map((entry) => ({
	date: entry, watt: Math.floor(Math.random() * 8001) - 3000, source: 'PowerVue'
}));

let lastPercent = Math.floor(Math.random() * 101);

const data2: DataTypePercentHour[] = dateTime.map((entry) => {
	// Generate a random number between -1 and 1
	const variation = Math.floor(Math.random() * 3) - 1;

	// Add the variation to the last percent
	lastPercent += variation;

	// Clamp the percent between 0 and 100
	lastPercent = Math.max(0, Math.min(100, lastPercent));

	return {
		date: entry,
		percent: lastPercent
	};
});

const data = [...data1, ...data3];

const DualYAxisAreaChart: React.FC = () => {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const parentRef = useRef<HTMLDivElement | null>(null);
	const { height, width } = useWindow();

	const marginTop = 20;
	const marginRight = 20;
	const marginBottom = 20;
	const marginLeft = 30;

	useEffect(() => {
		if (!svgRef.current || !parentRef.current) {
			return;
		}
		const width_p = parentRef.current.offsetWidth;
		const height_p = parentRef.current.offsetHeight;

		const svg = d3.select(svgRef.current)
			.attr('width', width_p)
			.attr('height', height_p)
			.attr('viewBox', [0, 0, width_p, height_p].join(' '))
			.attr('style', 'width: 100%; height: 90%; overflow: visible; font: 10px sans-serif; padding: 0px;');

		// Declare the x (horizontal position) scale.
		const x = d3.scaleUtc()
			.domain(d3.extent(dateTime, d => d) as [Date, Date])
			.range([marginLeft, width_p - marginRight]);

		const yMax = Math.ceil((d3.max(data, d => d.watt) ?? 0) / 2000) * 2000;
		const yMin = Math.floor((d3.min(data, d => d.watt) ?? 0) / 2000) * 2000;

		// Declare the y (vertical position) scale.
		const y1 = d3.scaleLinear()
			.domain([yMin, yMax])
			.range([height_p - marginBottom, marginTop]);

		// Declare the y (vertical position) scale.
		const y2 = d3.scaleLinear()
			.domain([0, 100])
			.range([height_p - marginBottom, marginTop]);

		const sources = d3.union(data.map(d => d.source), ['Battery']);

		const series = d3.stack<DataTypeWattHour>()
			.keys(d3.union(data.map(d => d.source)))
			.value(([, D], key) => D.get(key).watt)(d3.index(data, d => d.date, d => d.source));

		const area = d3.area<{ data: [DataTypeWattHour], '0': Date, '1': number }>()
			.x(d => x(d.data[0]) as number)
			.y0(d => y1(d[0]) as number)
			.y1(d => y1(d[1]) as number);

		const color = d3.scaleOrdinal()
			.domain(series.map(d => d.key))
			.range(d3.schemeTableau10);

		// Append area to the SVG
		svg.append('g')
			.selectAll('path')
			.data(series)
			.join('path')
			.attr('fill', d => color(d.key) as string)
			.attr('d', d => area(d) as string || '')
			.append('title')
			.text(d => d.key);

		// Create a line generator for data2
		const line = d3.line<DataTypePercentHour>()
			.x(d => x(d.date))
			.y(d => y2(d.percent));

		// For each tick...
		y1.ticks(Math.ceil((yMax - yMin) / 2000)).forEach(tickValue => {
			// Append a line to the SVG
			svg.append('line')
				.style('stroke', 'darkblue') // Set the line color
				.style('stroke-width', 0.5) // Set the line width
				.attr('x1', marginLeft) // Set the starting x-coordinate
				.attr('x2', width_p - marginRight) // Set the ending x-coordinate
				.attr('y1', y1(tickValue)) // Set the starting and ending y-coordinate
				.attr('y2', y1(tickValue));
		});

		// Append line to the SVG
		svg.append('path')
			.datum(data2)
			.attr('fill', 'none')
			.attr('stroke', 'green')
			.attr('stroke-width', 1.5)
			.attr('d', line);

		// Add the x-axis.
		svg.append('g')
			.attr('transform', `translate(0,${height_p})`)
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
			.attr('transform', `translate(${width_p - marginRight},0)`)
			.call(d3.axisRight(y2).ticks(Math.ceil((yMax - yMin) / 2000)).tickSize(0))
			.call(g => g.select('.domain').remove())
			.call(g => g.append('text')
				.attr('y', 5)
				.attr('fill', 'currentColor')
				.attr('text-anchor', 'start')
				.text('(%)'));

		// Legend
		const legend = svg.append('g')
			.attr('transform', `translate(${(marginLeft)}, ${height_p + marginBottom + 5})`);

		const legendItem = legend.selectAll('.legendItem')
			.data(sources)
			.enter().append('g')
			.attr('class', 'legendItem');

		legendItem.append('rect')
			.attr('x', (d, i) => i * 100)
			.attr('width', 18)
			.attr('height', 18)
			.style('fill', (d, i) => d === 'eGuage' ? 'steelblue' : d === 'Battery' ? 'green' : 'orange'); // Todo: Color Better

		legendItem.append('text')
			.attr('x', (d, i) => i * 100 + 24)
			.attr('y', 9)
			.attr('dy', '.35em')
			.style('text-anchor', 'start')
			.text((d) => d);
		return () => { svg.selectAll('*').remove(); };
	}, [svgRef, height, width]);

	// Return the SVG element.
	return (
		<div className='h-full w-full flex-1' ref={parentRef}>
			<svg ref={svgRef} />
		</div>
	);
};

export default DualYAxisAreaChart;
