import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { Config, eGaugeData } from './eGaugeTypes';

interface PanelChartSVGProps {
	parent: React.MutableRefObject<HTMLDivElement | null>;
	height: number;
	width: number;
	data: eGaugeData[];
	unit: string;
	config: Config;
}

const PanelChartSVG: React.FC<PanelChartSVGProps> = ({ width, height, data, unit, parent, config }) => {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const [lastMousePosition, setLastMousePosition] = useState<[number, number] | null>(null);
	const [isInSVG, setIsInSVG] = useState(false);
	let div = d3.select(parent.current).select('.tooltip') as d3.Selection<HTMLDivElement, unknown, null, undefined>;
	if (div.empty()) {
		div = d3.select(parent.current).append('div')
			.attr('class', 'tooltip absolute bg-slate-50 rounded-sm p-2',)
			.style('opacity', 0) as d3.Selection<HTMLDivElement, unknown, null, undefined>;
	}

	const marginTop = 20;
	const marginRight = 30;
	const marginBottom = 30;
	const marginLeft = 40;
	const formatTime = d3.timeFormat('%H:%M:%S');

	const timeRangeLimit = useMemo(() => {
		const [value, unit] = config.period.split(' ');
		let valueInMs;
		if (unit === 'minute') {
			valueInMs = parseInt(value) * 60 * 1000;
		} else if (unit === 'hour') {
			valueInMs = parseInt(value) * 60 * 60 * 1000;
		} else {
			valueInMs = parseInt(value) * 1000;
		}
		return valueInMs;
	}, [config.period]);

	const filteredData = useMemo(() => data.filter(d => d.dateTime && d.dateTime.getTime() >= new Date().getTime() - timeRangeLimit), [data, timeRangeLimit]);

	const xDomain = useMemo(() => d3.extent(filteredData, d => d.dateTime) as [Date, Date], [filteredData]);

	const x = useMemo(() => d3.scaleTime()
		.domain(xDomain)
		.range([marginLeft, width]), [xDomain, marginLeft, width]);

	const y = useMemo(() => d3.scaleLinear()
		.domain([0, (d3.max(filteredData, d => d.value) as number) * 1.4])
		.range([height - marginBottom, marginTop]), [filteredData, height]);

	const line = useMemo(() => d3.line<eGaugeData>()
		.x(d => x(d.dateTime) as number)
		.y(d => y(d.value) as number), [x, y]);

	const points = filteredData.map((d) => [x(d.dateTime), y(d.value)]);


	useEffect(() => {
		if (!svgRef.current || filteredData.length === 0 || !unit) return;

		const svg = d3.select(svgRef.current)
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height].join(' '))
			.attr('style', 'width: 100%; height: 100%; overflow: visible; font: 10px sans-serif; padding: 4px;');

		const timeRange = xDomain[1].getTime() - xDomain[0].getTime();
		const tickInterval = timeRange / 3; // Divide by 4 to get 5 ticks
		const tickValues = [
			new Date(xDomain[0].getTime() + tickInterval * 0.25),
			new Date(xDomain[0].getTime() + tickInterval * 1.5),
			new Date(xDomain[0].getTime() + tickInterval * 2.75),
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
			.attr('font-size', '10px');

		// Add the y-axis, remove the domain line, add grid lines and a label.
		svg.append('g')
			.attr('transform', `translate(${marginLeft},0)`)
			.call(d3.axisLeft(y).ticks(5))
			.attr('font-size', '10px')
			.call(g => g.select('.domain').remove())
			.call(g => g.selectAll('.tick line').clone()
				.attr('x2', width - marginLeft)
				.attr('stroke-opacity', 0.3))
			.call(g => g.append('text')
				.attr('x', -marginRight)
				.attr('y', 10)
				.attr('fill', 'currentColor')
				.attr('text-anchor', 'start')
				.text(`(${unit})`));

		// Append a path for the line.
		svg.append('path')
			.attr('fill', 'none')
			.attr('stroke', 'steelblue')
			.attr('stroke-width', 1.5)
			.attr('d', line(filteredData));

		return () => { svg.selectAll('*').remove(); };
	}, [div, filteredData, formatTime, height, lastMousePosition, line, points, unit, width, x, xDomain, y]);

	useEffect(() => {
		const svg = d3.select(svgRef.current);
		let line: d3.Selection<SVGLineElement, unknown, null, undefined>;

		// Define the mousemove function.
		const pointermoved = (event: React.PointerEvent<SVGSVGElement> | [number, number]) => {
			const [xm, ym] = Array.isArray(event) ? event : d3.pointer(event);
			svg.selectAll('.vertical-line').remove(); // Remove existing line
			if (!lastMousePosition || Math.abs(xm - lastMousePosition[0]) > 1 || Math.abs(ym - lastMousePosition[1]) > 1) {
				setLastMousePosition([xm, ym]);
			}

			const i = d3.leastIndex(points, ([x, y]) => Math.hypot(x - xm, y - ym));
			if (i === undefined) return;

			if (i < points.length) {
				const [x_i] = points[i];

				// Draw a vertical line at the x-axis
				svg.append('line')
					.attr('class', 'vertical-line')
					.attr('x1', x_i)
					.attr('y1', marginTop)
					.attr('x2', x_i)
					.attr('y2', height - marginBottom)
					.attr('stroke', 'black')
					.attr('stroke-width', 1)
					.attr('stroke-dasharray', '5,5');
			}

			div.html(`
							<p>Time: ${formatTime(filteredData[i].dateTime)}</p>
							<p>Energy Usage: ${filteredData[i].value.toString().substring(0, 5).replace(/\.$/, '')}${filteredData[i].unit}</p>`)
				.style('left', (xm - 100) + 'px')
				.style('top', (ym - 100) + 'px');
		};

		const pointerenter = (event: React.PointerEvent<SVGSVGElement>) => {
			const [xm] = Array.isArray(event) ? event : d3.pointer(event);

			// If the line doesn't exist, create it
			if (!line) {
				line = svg.append('line')
					.attr('class', 'vertical-line')
					.attr('stroke', 'black')
					.attr('stroke-width', 1)
					.attr('stroke-dasharray', '5,5');
			}

			// Update the position of the line
			line.attr('x1', xm)
				.attr('y1', marginTop)
				.attr('x2', xm)
				.attr('y2', height - marginBottom);

			div.transition()
				.duration(200)
				.style('opacity', .9);
			setIsInSVG(true);
		};

		// Append a group for the dot and text.
		const dot = svg.append('g')
			.attr('display', 'none');

		const pointerleft = () => {
			svg.selectAll('.vertical-line').remove(); // Remove all lines with class 'vertical-line'
			dot.attr('display', 'none');
			div.transition()
				.duration(500)
				.style('opacity', 0);

			div.style('left', (-1000) + 'px')
				.style('top', (-1000) + 'px');
			setIsInSVG(false);
		};

		// Add the event listeners to the svg.
		svg
			.on('pointermove', pointermoved)
			.on('pointerleave', pointerleft)
			.on('pointerenter', pointerenter)
			.on('touchstart', () => { }, { passive: true });
		if (isInSVG && lastMousePosition) {
			pointermoved(lastMousePosition);
		}
	}, [div, filteredData, formatTime, height, isInSVG, lastMousePosition, points]);

	return (<svg ref={svgRef} />);
};

export default PanelChartSVG;
