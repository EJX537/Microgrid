import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DataSteam } from './energyGenerationChart';

interface EnergyGenerationSVGProps {
  data: DataSteam;
  height: number;
  width: number;
}

const EnergyGenerationSVG: React.FC<EnergyGenerationSVGProps> = (props) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
		const { width, height, data } = props;
		if (!svgRef.current || !width || !height || !data) return;

    const size = Math.min(width, height);
    const dataStream = props.data;
    const percentage = dataStream.currentWatt / 5000;

    const svg = d3.select(svgRef.current)
      .attr('width', size)
      .attr('height', size)
      .attr('viewBox', [-size / 2, -size / 2, size, size].join(' '))
      .attr('style', 'width: 100%; height: 100%; overflow: visible; font: 10px sans-serif; padding: 0px;');

    const radius = size / 2;
    const arc = d3.arc()
      .innerRadius(radius - size / 10)
      .outerRadius(radius)
      .startAngle(4)
      .cornerRadius(20);

    // White arc
    svg.append('path')
      .datum({ startAngle: 2 * Math.PI, endAngle: 2.725 * Math.PI })
      .style('fill', '#D3D3D3')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('d', arc as any);

    // Green arc
    svg.append('path')
      .datum({ startAngle: percentage * 2 * Math.PI, endAngle: 2 * Math.PI })
      .style('fill', '#4CAF50')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('d', arc as any);

    // Text elements
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', `-${size / 5}px`)
      .style('font-size', `${size / 12}px`)
      .text(`${percentage * 100}%`);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .style('font-size', `${size / 8}px`)
      .style('fill', 'green')
      .text(`${dataStream.currentWatt} (W)`);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', `${size / 5}px`)
      .style('font-size', `${size / 10}px`)
      .style('fill', 'green')
      .text('On Grid');


    return () => { svg.selectAll('*').remove(); };
  }, [props]);

  // Return the SVG element.
  return <svg ref={svgRef} className='h-full w-full' />;
};

export default EnergyGenerationSVG;
