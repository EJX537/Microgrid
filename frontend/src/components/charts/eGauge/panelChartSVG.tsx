import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export interface PanelChartSVGData {
	dateTime: Date;
	value: number;
}

interface PanelChartSVGProps {
	height: number;
	width: number;
	data: PanelChartSVGData[];
	unit: string;
}

const PanelChartSVG: React.FC<PanelChartSVGProps> = (props: PanelChartSVGProps) => {
	const svgRef = useRef<SVGSVGElement | null>(null);

	const marginTop = 20;
	const marginRight = 30;
	const marginBottom = 30;
	const marginLeft = 40;

	useEffect(() => {
		const { width, height, data, unit } = props;
		if (!svgRef.current || !width || !height || data.length === 0 || !unit) return;

		const svg = d3.select(svgRef.current)
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height].join(' '))
			.attr('style', 'width: 100%; height: 100%; overflow: visible; font: 10px sans-serif; padding: 4px;');

		const lastestData = data[0];
		const oneHourAgo = new Date(lastestData.dateTime.getTime() - 60 * 60 * 1000);
		const filteredData = props.data.filter(d => d.dateTime !== undefined && d.dateTime >= oneHourAgo);

		const x = d3.scaleTime()
			.domain(d3.extent(filteredData, d => d.dateTime) as [Date, Date])
			.range([marginLeft, width]);

		const y = d3.scaleLinear().domain([0, d3.max(filteredData, d => d.value) as number]).range([height - marginBottom, marginTop]);

		const points = filteredData.map((d) => [x(d.dateTime), y(d.value)]);

		// Declare the line generator.
		const line = d3.line<PanelChartSVGData>()
			.x(d => x(d.dateTime) as number)
			.y(d => y(d.value) as number);

		// Add the x-axis.
		svg.append('g')
			.attr('transform', `translate(0,${height - marginBottom})`)
			.call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
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
		const path = svg.append('path')
			.attr('fill', 'none')
			.attr('stroke', 'steelblue')
			.attr('stroke-width', 1.5)
			.attr('d', line(filteredData));

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

		function pointermoved(event: React.PointerEvent<SVGSVGElement>) {
			const [xm, ym] = d3.pointer(event);
			const i = d3.leastIndex(points, ([x, y]) => Math.hypot(x - xm, y - ym));
			if (i === undefined) return;

			const [x, y] = points[i];
			path.style('mix-blend-mode', 'multiply').style('stroke', 'steelblue');
			dot.attr('display', null).attr('transform', `translate(${x},${y})`);
			dot.select('text').attr('font-size', '16px').text(`${formatTime(data[i].dateTime)}: ${data[i].value} ${unit}`);
		}

		function pointerleft() {
			path.style('mix-blend-mode', 'multiply').style('stroke', null);
			dot.attr('display', 'none');
		}

		// Add the event listeners to the svg.
		svg
			.on('pointermove', pointermoved)
			.on('pointerleave', pointerleft)
			.on('touchstart', event => event.preventDefault());

		return () => { svg.selectAll('*').remove(); };

	}, [props, svgRef]);

	return (<svg ref={svgRef} />);
};

export default PanelChartSVG;
