import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { DataTypeWattHour } from './overviewEnergyChart';

interface DualYAxisAreaChartSVGProps {
	parent: React.MutableRefObject<HTMLDivElement | null>;
	height: number;
	width: number;
	data: Record<string, DataTypeWattHour[]>;
	capacity: number;
}

const DualYAxisAreaChartSVG: React.FC<DualYAxisAreaChartSVGProps> = ({ width, height, capacity, data, parent }) => {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const [div, setDiv] = useState<d3.Selection<HTMLDivElement, unknown, null, undefined> | null>(null);

	useEffect(() => {
		const tooltips = document.querySelectorAll('div.tooltip');
		tooltips.forEach(tooltip => tooltip.remove());
		setDiv(d3.select(parent.current)
			.append('div')
			.attr('class', 'tooltip absolute bg-slate-50 rounded-sm p-2',)
			.style('opacity', 0));
	}, [width, height, parent]);

	const marginTop = 20;
	const marginRight = 20;
	const marginBottom = 20;
	const marginLeft = 30;

	const batteryData: DataTypeWattHour[] = data?.battery;
	const otherData: DataTypeWattHour[] = d3.merge(Object.values(data).filter(d => d !== batteryData));

	// Declare the y (vertical position) scale.
	const yMax = useMemo(
		() => Math.ceil((d3.max(otherData, d => d.watt) ?? 0) / 2000) * 2000
		, [otherData]);
	const yMin = useMemo(
		() => Math.floor((d3.min(otherData, d => d.watt) ?? 0) / 2000) * 2000
		, [otherData]);

	// Declare the x (horizontal position) scale.
	const x = useMemo(
		() => d3.scaleTime(d3.extent(batteryData, d => d.dateTime) as [Date, Date], [marginLeft, width - marginRight])
		, [batteryData, width]);

	// Declare the y (vertical position) scale.
	const y1 = useMemo(() => d3.scaleLinear()
		.domain([yMin, yMax])
		.range([height - 95, marginTop]), [height, yMax, yMin]);

	const y2 = useMemo(() => d3.scaleLinear()
		.domain([0, 100])
		.range([height - 95, marginTop]), [height]);

	const line = useMemo(() => d3.line<DataTypeWattHour>()
		.x(d => x(d.dateTime) ?? 0)
		.y(d => y2((d.watt / capacity) * 100))
		.curve(d3.curveMonotoneX), [capacity, x, y2]);

	const area = useMemo(() => d3.area<DataTypeWattHour>()
		.x(d => x(d.dateTime))
		.y0(d => y1(d.watt))
		.y1(y1(0))
		.curve(d3.curveMonotoneX), [x, y1]);

	const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

	useEffect(() => {
		if (!svgRef.current || !data) return;
		const svg = d3.select(svgRef.current)
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height].join(' '))
			.attr('style', 'width: 100%; height: 100%; overflow: hidden; font: 10px sans-serif; padding: 0px;');

		const sources = d3.union(otherData.map(d => d.source), ['battery']);

		Array.from(otherData.reduce((set, d) => set.add(d.source), new Set<string>())).filter(source => source !== 'battery').forEach((source: string) => {
			const data = otherData.filter(d => d.source === source);

			svg.append('path')
				.datum(data)
				.attr('fill', colorScale(source))
				.attr('stroke', colorScale(source)) // add stroke color
				.attr('stroke-width', 3) // increase stroke width
				.attr('opacity', 0.5) // reduce opacity
				.attr('stroke-opacity', 1) // set stroke opacity to 1
				.attr('fill-opacity', 0.5) // set fill opacity to 0.5
				.attr('d', area);
		});

		svg.append('path')
			.datum(batteryData)
			.attr('fill', 'none')
			.attr('stroke', colorScale('battery'))
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
				.attr('y', 9)
				.attr('fill', 'currentColor')
				.attr('text-anchor', 'start')
				.text('(W)'));

		// Add the y-axis 2.
		svg.append('g')
			.attr('transform', `translate(${width - marginRight}, ${marginBottom - marginTop})`)
			.call(d3.axisRight(y2).ticks(Math.ceil((yMax - yMin) / 2000)).tickSize(0))
			.call(g => g.select('.domain').remove())
			.call(g => g.append('text')
				.attr('y', 9)
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
			.attr('x', (_, i) => i * 100)
			.attr('width', 18)
			.attr('height', 18)
			.style('fill', (d) => d === 'eGuage' ? 'steelblue' : d === 'battery' ? 'green' : 'orange'); // Todo: Color From Source

		legendItem.append('text')
			.attr('x', (_, i) => i * 100 + 24)
			.attr('y', 9)
			.attr('dy', '.35em')
			.style('text-anchor', 'start')
			.attr('font-size', '14px')
			.text((d) => d);

		// Append a group for the dot and text.
		const dot = svg.append('g')
			.attr('display', 'none');

		dot.append('circle')
			.attr('r', 2.5);

		dot.append('text')
			.attr('text-anchor', 'middle')
			.attr('y', -8);

		// Define the mousemove function.
		const formatTime = d3.timeFormat('%H:%M:%S');

		const pointermoved = (event: React.PointerEvent<SVGSVGElement>) => {
			svg.selectAll('.vertical-line').remove(); // Remove existing line
			const [xm] = d3.pointer(event);
			const xTime = x.invert(xm);

			// Find the closest data entry along the x-axis
			const bisect = d3.bisector((d: DataTypeWattHour) => d.dateTime).left;

			const index = bisect(batteryData, xTime, 1);
			const d0 = batteryData[index - 1];
			const d1 = batteryData[index];

			if (!d0 || !d1) return;

			const closestData = xTime.getTime() - d0.dateTime.getTime() > d1.dateTime.getTime() - xTime.getTime() ? d1 : d0;

			// Filter the data for all entries with the closest time
			const filteredDataOther = otherData.filter((d: DataTypeWattHour) => {
				return d.dateTime.getTime() === closestData.dateTime.getTime();
			});

			// Draw a vertical line at the x-axis
			svg
				.append('line')
				.attr('class', 'vertical-line')
				.attr('x1', x(closestData.dateTime))
				.attr('y1', marginTop)
				.attr('x2', x(closestData.dateTime))
				.attr('y2', height - marginBottom)
				.attr('stroke', 'black')
				.attr('stroke-width', 1)
				.attr('stroke-dasharray', '5,5');

			div?.transition()
				.duration(200)
				.style('opacity', .9);

			div?.html(`
				<p>Time: ${formatTime(closestData.dateTime)}</p>
				<p class='text-[${colorScale('battery')}]'>Battery: ${((closestData.watt / capacity) * 100).toFixed(2)}%</p>
				${filteredDataOther.map((d: DataTypeWattHour) => `<p style="color:${colorScale(d.source)}">${d.source}: ${d.watt} W</p>`).join('')}`)
				.style('left', (d3.pointer(event)[0] - 100) + 'px')
				.style('top', (d3.pointer(event)[1] - 100) + 'px');
		};

		const pointerleft = () => {
			svg.selectAll('.vertical-line').remove(); // Remove all lines with class 'vertical-line'
			dot.attr('display', 'none');
			div?.transition()
				.duration(500)
				.style('opacity', 0);

			div?.style('left', (-1000) + 'px')
				.style('top', (-1000) + 'px');
		};

		// Add the event listeners to the svg.
		svg
			.on('pointermove', pointermoved)
			.on('pointerleave', pointerleft)
			.on('touchstart', () => { }, { passive: true });

		return () => { svg.selectAll('*').remove(); };
	}, [area, batteryData, capacity, colorScale, data, div, line, otherData, width, height, x, y1, y2, yMax, yMin]);

	// Return the SVG element.
	return <svg ref={svgRef} />;
};

export default DualYAxisAreaChartSVG;


