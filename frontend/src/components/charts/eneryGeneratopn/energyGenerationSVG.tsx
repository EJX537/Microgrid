import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DataSteam } from './energyGenerationChart';

interface EnergyGenerationSVGProps {
  data: DataSteam
}

const EnergyGenerationSVG: React.FC<EnergyGenerationSVGProps> = (props) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !parentRef.current) {
      return;
    }
    const width = parentRef.current.offsetWidth;
    const height = parentRef.current.offsetHeight;
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
      .attr('d', arc as any);

    // Green arc
    svg.append('path')
      .datum({ startAngle: percentage * 2 * Math.PI, endAngle: 2 * Math.PI })
      .style('fill', '#4CAF50')
      .attr('d', arc as any);

    // Text elements
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', `-${size / 7}px`)
      .style('font-size', `${size / 17}px`)
      .text(`${percentage * 100}%`);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .style('font-size', `${size / 7}px`)
      .style('fill', 'green')
      .text(`${dataStream.currentWatt}`);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', `${size / 11}px`)
      .style('font-size', `${size / 17}px`)
      .text('Power (W)');

  }, [props]);

	// Return the SVG element.
  return (
    <div className='h-full w-full flex-1 flex' ref={parentRef}>
      <svg ref={svgRef} className='h-full w-full' />
    </div>
  );
};

export default EnergyGenerationSVG;
