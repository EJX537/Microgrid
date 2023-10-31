import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import dataIm from './data.json';


interface Data {
	date: string;
  industry: string;
  unemployed: number;
}

interface Props {
	data: Data[];
}
const data: Data[] = dataIm;

const Chart: React.FC<Props> = () => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      const svg = d3.select(ref.current);

      const width = 928;
      const height = 500;
      const marginTop = 10;
      const marginRight = 10;
      const marginBottom = 20;
      const marginLeft = 40;

      const series = d3.stack<Data>()
        .keys(d3.union(data.map(d => d.industry)))
        .value(([, D], key) => D.get(key).unemployed)
        (d3.index(data, d => new Date(d.date), d => d.industry));

      const x = d3.scaleUtc()
        .domain(d3.extent(data, d => new Date(d.date)) as [Date, Date])
        .range([marginLeft, width - marginRight]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1])) as number])
        .rangeRound([height - marginBottom, marginTop]);

      const color = d3.scaleOrdinal()
        .domain(series.map(d => d.key))
        .range(d3.schemeTableau10);

      const area = d3.area<{data: [Date], '0': number, '1': number}>()
        .x(d => x(d.data[0]) as number)
        .y0(d => y(d[0]) as number)
        .y1(d => y(d[1]) as number);

      svg.attr('viewBox', [0, 0, width, height].join(' '))
         .style('max-width', '100%')
         .style('height', 'auto');

      svg.append('g')
        .attr('transform', `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(height / 80))
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line').clone()
            .attr('x2', width - marginLeft - marginRight)
            .attr('stroke-opacity', 0.1))
        .call(g => g.append('text')
            .attr('x', -marginLeft)
            .attr('y', 10)
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'start')
            .text('↑ Unemployed persons'));

      svg.append('g')
        .selectAll('path')
        .data(series)
        .join('path')
          .attr('fill', d => color(d.key) as string)
          .attr('d', area)
        .append('title')
          .text(d => d.key);

      svg.append('g')
        .attr('transform', `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));
    }
  }, []);

  return <svg ref={ref} />;
};

export default Chart;
