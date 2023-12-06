import { Config, DataStream } from './batteryChartTypes';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

interface batteryCapacitySVGProps {
	data: DataStream;
	height: number;
	width: number;
	capacity: number;
	config: Config;
}

const BatteryCapacitySVG: React.FC<batteryCapacitySVGProps> = (props) => {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const { width, height, data, capacity, config } = props;
	const size = Math.min(width, height);
	const radius = size / 2;
	const rootAngle = Math.PI * 1.25;

	const arc = useMemo(() => d3.arc()
		.innerRadius(radius - size / 10)
		.outerRadius(radius)
		.startAngle(Math.PI * 1.25)
		.cornerRadius(20), [radius, size]);

	const animateProjectedArc = useCallback((startPercentage: number, endPercentage: number, animateArc: d3.Selection<SVGPathElement, { startAngle: number; endAngle: number; }, null, undefined>) => {
		const startAngle = rootAngle + Math.PI * startPercentage * 1.5;
		const endAngle = rootAngle + Math.PI * endPercentage * 1.5;
		animateArc.transition()
			.duration(config.animationSpeed)
			.attrTween('d', (d: { startAngle: number; endAngle: number; }) => {
				const i = d3.interpolate(startAngle, endAngle);
				return (t: number) => {
					d.endAngle = i(t);
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					return arc(d as any) || '';
				};
			})
			.on('end', () => animateProjectedArc(startPercentage, endPercentage, animateArc));
	}, [arc, rootAngle, config.animationSpeed]);

	// Do the same for animateProjectedArcReverse
	const animateProjectedArcReverse = useCallback((startPercentage: number, endPercentage: number, animateArc: d3.Selection<SVGPathElement, { startAngle: number; endAngle: number; }, null, undefined>) => {
		const startAngle = rootAngle + Math.PI * startPercentage * 1.5;
		const endAngle = rootAngle + Math.PI * endPercentage * 1.5;
		animateArc.transition()
			.duration(config.animationSpeed)
			.attrTween('d', (d: { startAngle: number; endAngle: number; }) => {
				const i = d3.interpolate(endAngle, startAngle);
				return (t: number) => {
					d.endAngle = i(t);
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					return arc(d as any) || '';
				};
			})
			.on('end', () => animateProjectedArcReverse(startPercentage, endPercentage, animateArc));
	}, [arc, rootAngle, config.animationSpeed]);

	const getArcAngles = (percentage: number) => {
		const startAngle = Math.PI * 1.25;
		const endAngle = startAngle + Math.PI * percentage * 1.5;
		return { startAngle, endAngle };
	};

	useEffect(() => {
		if (!svgRef.current) return;
		const svg = d3.select(svgRef.current)
			.attr('width', size)
			.attr('height', size)
			.attr('viewBox', [-size / 2, -size / 2, size, size].join(' '))
			.attr('style', 'width: 100%; height: 100%; overflow: visible; font: 10px sans-serif; padding: 0px;');

		// Total arc
		svg.append('path')
			.datum({ endAngle: Math.PI * 2.75 })
			.style('fill', '#D3D3D3')
			.attr('class', 'total-arc') // Add class attribute
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.attr('d', arc as any);
		return () => {
			svg.selectAll('*').remove();
		};
	}, [arc, size]);

	useEffect(() => {
		if (!svgRef.current || !data) return;
		const svg = d3.select(svgRef.current);

		const dataStream = props.data;
		const onGrid = dataStream.gridTo || dataStream.toGrid;
		const percentage = dataStream.soc / 100;
		const projectedWatt = dataStream.battPower + capacity * percentage;
		const projectedPercentage = projectedWatt / capacity;
		const isCharging = projectedWatt > capacity * percentage;

		if (isCharging) {
			// Projected Charge arc
			svg.append('path')
				.datum(getArcAngles(projectedPercentage))
				.style('fill', '#8BC34A')
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.attr('d', arc as any);
			// Current Charge arc
			const currentChargeArc = svg.append('path')
				.datum(getArcAngles(percentage))
				.style('fill', '#4CAF50')
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.attr('d', arc as any);
			animateProjectedArc(percentage, projectedPercentage, currentChargeArc);
		} else {
			// Current Charge arc
			svg.append('path')
				.datum(getArcAngles(percentage))
				.style('fill', '#FF5733')
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.attr('d', arc as any);

			const projectedArc = svg.append('path')
				.datum(getArcAngles(projectedPercentage))
				.style('fill', '#8BC34A')
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.attr('d', arc as any);
			animateProjectedArcReverse(projectedPercentage, percentage, projectedArc);
		}

		// Text elements
		svg.append('text')
			.attr('text-anchor', 'middle')
			.attr('dy', `-${size / 5}px`)
			.style('font-size', `${size / 12}px`)
			.text(`${(percentage * 100).toFixed(2)}%`);

		svg.append('text')
			.attr('text-anchor', 'middle')
			.style('font-size', `${size / 8}px`)
			.style('fill', dataStream.pac <= 0 ? '#FF5733' : '#4CAF50')
			.text(`${dataStream.pac} (W)`);

		svg.append('text')
			.attr('text-anchor', 'middle')
			.attr('dy', `${size / 5}px`)
			.style('font-size', `${size / 10}px`)
			.style('fill', onGrid ? '#4CAF50' : '#FF5733')
			.text(onGrid ? 'On Grid' : 'Off Grid');

		return () => {
			svg.selectAll('path:not(.total-arc), text').remove();
		};
	}, [animateProjectedArc, animateProjectedArcReverse, arc, capacity, config.danger, config.warning, data, props.data, size]);

	// Return the SVG element.
	return <svg ref={svgRef} className='h-full w-full' />;
};

export default BatteryCapacitySVG;
