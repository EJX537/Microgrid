import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { DataTypeWattHour } from './overviewEnergyChart';

interface DualYAxisAreaChartSVGProps {
	height: number;
	width: number;
	data: DataTypeWattHour[];
	capacity: number;
}

const DualYAxisAreaChartSVG: React.FC<DualYAxisAreaChartSVGProps> = (props: DualYAxisAreaChartSVGProps) => {
	const svgRef = useRef<SVGSVGElement | null>(null);

	const marginTop = 20;
	const marginRight = 20;
	const marginBottom = 20;
	const marginLeft = 30;

	useEffect(() => {
		const { width, height, capacity, data } = props;
		if (!svgRef.current || !width || !height || data.length === 0) return;

		const batteryData = data.filter(d => d.source === 'battery');
		const otherData = data.filter(d => d.source !== 'battery');
		
		const svg = d3.select(svgRef.current)
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height].join(' '))
			.attr('style', 'width: 100%; height: 100%; overflow: hidden; font: 10px sans-serif; padding: 0px;');

		// Declare the x (horizontal position) scale.
		const x = d3.scaleUtc(d3.extent(data, d => d.dateTime) as [Date, Date], [marginLeft, width - marginRight]);

		// Declare the y (vertical position) scale.
		const yMax = Math.ceil((d3.max(otherData, d => d.watt) ?? 0) / 2000 + 1) * 2000;
		const yMin = Math.floor((d3.min(otherData, d => d.watt) ?? 0) / 2000) * 2000;

		const y1 = d3.scaleLinear()
			.domain([yMin, yMax])
			.range([height - 100, marginTop]);

		// Declare the y (vertical position) scale.
		const y2 = d3.scaleLinear()
			.domain([0, 100])
			.range([height - 100, marginTop]);

		const sources = d3.union(data.map(d => d.source));

		const series = d3.stack<{ source: string, watt: number }, string>()
			.keys(sources)
			.value(([, D], key) => D.get(key)?.watt ?? 0)(d3.rollup(otherData, ([d]) => d, d => d.dateTime, d => d.source));

		const color = d3.scaleOrdinal<string>()
			.domain(series.map(d => d.key))
			.range(d3.schemeTableau10);

		const area = d3.area<{data: DataTypeWattHour, '0': number, '1': number }>()
			.x(d => x(d.data[0]) as number)
			.y0(d => y1(d[0]) as number)
			.y1(d => y1(d[1]) as number);

		const line = d3.line<DataTypeWattHour>()
			.x(d => x(d.dateTime))
			.y(d => y2((d.watt / capacity) * 100));

		svg.append('g')
			.selectAll('path')
			.data(series)
			.join('path')
			.attr('fill', d => color(d.key) as string)
			.attr('d', d => area(d) as string || '')
			.append('title')
			.text(d => d.key);

		svg.append('path')
			.datum(batteryData)
			.attr('fill', 'none')
			.attr('stroke', 'green')
			.attr('stroke-width', 1.5)
			.attr('d', line);

		// For each tick...
		y1.ticks(6).forEach(tickValue => {
			// Append a line to the SVG
			svg.append('line')
				.style('stroke', 'darkblue') // Set the line color
				.style('stroke-width', 0.5) // Set the line width
				.attr('x1', marginLeft) // Set the starting x-coordinate
				.attr('x2', width - marginRight) // Set the ending x-coordinate
				.attr('y1', y1(tickValue)) // Set the starting and ending y-coordinate
				.attr('y2', y1(tickValue));
		});

		// Add the x-axis.
		svg.append('g')
			.attr('transform', `translate(0,${height - 70})`)
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
			.attr('transform', `translate(${marginLeft},${marginBottom - marginTop})`)
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
			.attr('transform', `translate(${width - marginRight}, ${marginBottom - marginTop})`)
			.call(d3.axisRight(y2).ticks(Math.ceil((yMax - yMin) / 2000)).tickSize(0))
			.call(g => g.select('.domain').remove())
			.call(g => g.append('text')
				.attr('y', 5)
				.attr('fill', 'currentColor')
				.attr('text-anchor', 'start')
				.text('(%)'));

		// Legend
		const legend = svg.append('g')
			.attr('transform', `translate(${(marginLeft)}, ${height - 30})`);

		const legendItem = legend.selectAll('.legendItem')
			.data(sources)
			.enter().append('g')
			.attr('class', 'legendItem');

		legendItem.append('rect')
			.attr('x', (d, i) => i * 100)
			.attr('width', 18)
			.attr('height', 18)
			.style('fill', (d) => d === 'eGuage' ? 'steelblue' : d === 'battery' ? 'green' : 'orange'); // Todo: Color Better

		legendItem.append('text')
			.attr('x', (_, i) => i * 100 + 24)
			.attr('y', 9)
			.attr('dy', '.35em')
			.style('text-anchor', 'start')
			.text((d) => d);
		return () => { svg.selectAll('*').remove(); };
	}, [svgRef, props]);

	// Return the SVG element.
	return <svg ref={svgRef} />;
};

export default DualYAxisAreaChartSVG;


