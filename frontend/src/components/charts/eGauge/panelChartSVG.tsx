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
		const { width, height, data } = props;
		if (!svgRef.current || !width || !height || data.length === 0) return;

		const svg = d3.select(svgRef.current)
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height].join(' '))
		.attr('style', 'width: 100%; height: 90%; overflow: visible; font: 10px sans-serif; padding: 0px;');

		const lastestData = data[0];
		const oneHourAgo = new Date(lastestData.dateTime.getTime() - 60 * 60 * 1000);
		const filteredData = props.data.filter(d => d.dateTime !== undefined && d.dateTime >= oneHourAgo);
		const x = d3.scaleUtc(d3.extent(filteredData, d => d.dateTime) as [Date, Date], [marginLeft, width]);
		const y = d3.scaleLinear([0, d3.max(filteredData, d => d.value)] as [number, number], [height - marginBottom, marginTop]);

		// Declare the line generator.
		const line = d3.line<PanelChartSVGData>()
			.x(d => x(d.dateTime))
			.y(d => y(d.value));

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
				.attr('y', 15)
				.attr('fill', 'currentColor')
				.attr('text-anchor', 'start')
				.text(`(${props.unit})`));

		// Append a path for the line.
		svg.append('path')
			.attr('fill', 'none')
			.attr('stroke', 'steelblue')
			.attr('stroke-width', 1.5)
			.attr('d', line(filteredData));

		return () => { svg.selectAll('*').remove(); };

	}, [props, svgRef]);

	return (<svg ref={svgRef} />);
};

export default PanelChartSVG;
