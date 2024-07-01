import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { WorkItem } from '../types/WorkItem';

interface AgingChartProps {
  workItems: WorkItem[];
}

const AgingChart: React.FC<AgingChartProps> = ({ workItems }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (workItems.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const statuses = ['In Progress', 'In Review', 'In Test'];
    const x = d3.scaleBand()
      .domain(statuses)
      .range([0, width])
      .padding(0.1);

    const maxAge = d3.max(workItems, d => {
      const age = (new Date().getTime() - d.inProgress.getTime()) / (1000 * 60 * 60 * 24);
      return isNaN(age) ? 0 : Math.ceil(age);
    }) || 0;

    const y = d3.scaleLinear()
      .domain([0, maxAge])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('padding', '10px')
      .style('display', 'none');

    statuses.forEach(status => {
      const statusItems = workItems.filter(item => item.status === status);
      
      svg.selectAll(`.dot-${status}`)
        .data(statusItems)
        .enter().append('circle')
        .attr('class', `dot-${status}`)
        .attr('cx', x(status)! + x.bandwidth() / 2)
        .attr('cy', d => {
          const age = (new Date().getTime() - d.inProgress.getTime()) / (1000 * 60 * 60 * 24);
          return isNaN(age) ? y(0) : y(age);
        })
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .on('mouseover', (event, d) => {
          tooltip.transition()
            .duration(200)
            .style('display', 'block');
          tooltip.html(`Key: ${d.key}<br/>Summary: ${d.summary}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', () => {
          tooltip.transition()
            .duration(500)
            .style('display', 'none');
        });
    });

  }, [workItems]);

  return <svg ref={chartRef}></svg>;
};

export default AgingChart;