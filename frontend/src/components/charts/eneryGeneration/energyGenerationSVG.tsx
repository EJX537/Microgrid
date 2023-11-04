import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DataSteam } from './energyGenerationChart';

interface EnergyGenerationSVGProps {
  data: DataSteam;
  height: number;
  width: number;
  capacity: number;
}

const EnergyGenerationSVG: React.FC<EnergyGenerationSVGProps> = (props) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    const { width, height, data, capacity } = props;
    if (!svgRef.current || !width || !height || !data) return;

    const size = Math.min(width, height);
    const dataStream = props.data;
    const percentage = dataStream.currentWatt / capacity;

    const svg = d3.select(svgRef.current)
      .attr('width', size)
      .attr('height', size)
      .attr('viewBox', [-size / 2, -size / 2, size, size].join(' '))
      .attr('style', 'width: 100%; height: 100%; overflow: visible; font: 10px sans-serif; padding: 0px;');

    const radius = size / 2;
    const arc = d3.arc()
      .innerRadius(radius - size / 10)
      .outerRadius(radius)
      .startAngle(Math.PI * 1.25)
      .cornerRadius(20);

    const getArcAngles = (percentage: number) => {
      const startAngle = Math.PI * 1.25;
      const endAngle = startAngle + Math.PI * percentage * 1.5;
      return { startAngle, endAngle };
    };

    // Total arc
    svg.append('path')
      .datum({ endAngle: Math.PI * 2.75 })
      .style('fill', '#D3D3D3')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('d', arc as any);

    // Projected Charge arc
    const projectedArc = svg.append('path')
      .datum(getArcAngles(.8))
      .style('fill', '#8BC34A')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('d', arc as any);



    const animateProjectedArc = (startPercentage: number, endPercentage: number) => {
      const rootAngle = Math.PI * 1.25;

      const startAngle = rootAngle + Math.PI * startPercentage * 1.5;

      const endAngle = rootAngle + Math.PI * endPercentage * 1.5;

      projectedArc.transition()
        .duration(4000)
        .attrTween('d', (d: any) => {
          const i = d3.interpolate(startAngle, endAngle);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (t: any) => {
            d.endAngle = i(t);
            return arc(d);
          };
        })
        .on('end', () => animateProjectedArc(startPercentage, endPercentage));
    };

    animateProjectedArc(percentage, percentage + .1);

    // Current Charge arc
    const currentChargeArc = svg.append('path')
      .datum(getArcAngles(percentage))
      .style('fill', '#4CAF50')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('d', arc as any);

    // // Projected Depletion arc
    // const projectedDepletedArc = svg.append('path')
    //   .datum(getArcAngles(.8))
    //   .style('fill', 'lightcoral')
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   .attr('d', arc as any);

    function animateProjectedArcReverse(startPercentage: number, endPercentage: number) {
      const rootAngle = Math.PI * 1.25;
      const startAngle = rootAngle + Math.PI * startPercentage * 1.5;

      const endAngle = rootAngle + Math.PI * endPercentage * 1.5;

      currentChargeArc.transition()
        .duration(4000)
        .attrTween('d', (d: any) => {
          const i = d3.interpolate(endAngle, startAngle);
          return (t: any) => {
            d.endAngle = i(t);
            return arc(d);
          };
        })
        .on('end', () => animateProjectedArcReverse(startPercentage, endPercentage));
    }

    animateProjectedArcReverse(percentage - .1, percentage);

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
