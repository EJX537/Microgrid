import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { eGaugeData } from './interface/eGaugeTypes';


interface PanelChartSVGProps {
	parent: React.MutableRefObject<HTMLDivElement | null>;
	height: number;
	width: number;
	data: eGaugeData[];
	unit: string;
}

const PanelChartSVG: React.FC<PanelChartSVGProps> = (props: PanelChartSVGProps) => {
	const svgRef = useRef<SVGSVGElement | null>(null);


	let div = d3.select(props.parent.current).select('.tooltip') as d3.Selection<HTMLDivElement, unknown, null, undefined>;
	if (div.empty()) {
		div = d3.select(props.parent.current).append('div')
			.attr('class', 'tooltip absolute bg-slate-50 rounded-sm p-2',)
			.style('opacity', 0) as d3.Selection<HTMLDivElement, unknown, null, undefined>;
	}
	const marginTop = 20;
	const marginRight = 30;
	const marginBottom = 30;
	const marginLeft = 40;

	const { width, height, data, unit } = props;

	const y = useMemo(() => d3.scaleLinear()
		.domain([0, d3.max(data, d => d.value) as number])
		.range([height - marginBottom, marginTop]), [data, height]);

	useEffect(() => {
		if (!svgRef.current || !width || !height || data.length === 0 || !unit) return;

		const svg = d3.select(svgRef.current)
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height].join(' '))
			.attr('style', 'width: 100%; height: 100%; overflow: visible; font: 10px sans-serif; padding: 4px;');

		const filteredData = props.data.filter(d => d.dateTime !== undefined && d.dateTime.getTime() >= new Date().getTime() - 90 * 1000);

		const xDomain = d3.extent(filteredData, d => d.dateTime) as [Date, Date];

		const x = d3.scaleTime()
			.domain(xDomain)
			.range([marginLeft, width]);

		const line = d3.line<eGaugeData>()
			.x(d => x(d.dateTime) as number)
			.y(d => y(d.value) as number);

		const points = filteredData.map((d) => [x(d.dateTime), y(d.value)]);

		const timeRange = xDomain[1].getTime() - xDomain[0].getTime();
		const tickInterval = timeRange / 3; // Divide by 4 to get 5 ticks
		const tickValues = [
			new Date(xDomain[0].getTime() + tickInterval * .5),
			new Date(xDomain[0].getTime() + tickInterval * 1.5),
			new Date(xDomain[0].getTime() + tickInterval * 2.5),
		];

		const xAxis = d3.axisBottom(x)
			.tickValues(tickValues) // Use the calculated ticks
			.tickSizeOuter(0)
			.tickFormat(d => {
				const formatted = d3.timeFormat('%H:%M:%S')(d as Date);
				return formatted;
			});

		// Add the x-axis to the SVG
		svg.append('g')
			.attr('transform', `translate(0,${height - marginBottom})`)
			.call(xAxis)
			.attr('font-size', '14px');

		// Add the y-axis, remove the domain line, add grid lines and a label.
		svg.append('g')
			.attr('transform', `translate(${marginLeft},0)`)
			.call(d3.axisLeft(y).ticks(height / 60))
			.attr('font-size', '14px')
			.call(g => g.select('.domain').remove())
			.call(g => g.selectAll('.tick line').clone()
				.attr('x2', width - marginLeft)
				.attr('stroke-opacity', 0.3))
			.call(g => g.append('text')
				.attr('x', -marginRight)
				.attr('y', 10)
				.attr('fill', 'currentColor')
				.attr('text-anchor', 'start')
				.text(`(${props.unit})`));

		// Append a path for the line.
		svg.append('path')
			.attr('fill', 'none')
			.attr('stroke', 'steelblue')
			.attr('stroke-width', 1.5)
			.attr('d', line(filteredData));


		// Append a group for the dot and text.
		const dot = svg.append('g')
			.attr('display', 'none');

		// Define the mousemove function.
		const formatTime = d3.timeFormat('%H:%M:%S');

		const pointermoved = (event: React.PointerEvent<SVGSVGElement>) => {
			svg.selectAll('.vertical-line').remove(); // Remove existing line
			const [xm, ym] = d3.pointer(event);
			const i = d3.leastIndex(points, ([x, y]) => Math.hypot(x - xm, y - ym));
			if (i === undefined) return;

			const [x_i] = points[i];

			// Draw a vertical line at the x-axis
			svg
				.append('line')
				.attr('class', 'vertical-line')
				.attr('x1', x_i)
				.attr('y1', marginTop)
				.attr('x2', x_i)
				.attr('y2', height - marginBottom)
				.attr('stroke', 'black')
				.attr('stroke-width', 1)
				.attr('stroke-dasharray', '5,5');

			div.transition()
				.duration(200)
				.style('opacity', .9);

			div.html(`
				<p>Time: ${formatTime(filteredData[i].dateTime)}</p>
				<p>Energy Usage: ${filteredData[i].value.toFixed(2)}${filteredData[i].unit}</p>`)
				.style('left', (d3.pointer(event)[0] - 100) + 'px')
				.style('top', (d3.pointer(event)[1] - 100) + 'px');
		};

		const pointerleft = () => {
			svg.selectAll('.vertical-line').remove(); // Remove all lines with class 'vertical-line'
			dot.attr('display', 'none');
			div.transition()
				.duration(500)
				.style('opacity', 0);

			div.style('left', (-1000) + 'px')
				.style('top', (-1000) + 'px');
		};

		// Add the event listeners to the svg.
		svg
			.on('pointermove', pointermoved)
			.on('pointerleave', pointerleft)
			.on('touchstart', () => { }, { passive: true });

		return () => { svg.selectAll('*').remove(); };
	}, [data, div, height, props.data, props.unit, unit, width, y]);

	return (<svg ref={svgRef} />);
};

export default PanelChartSVG;
