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

    const margin = { top: 20, right: 120, bottom: 40, left: 50 };
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

    const ages = workItems.map(d => {
      const age = (new Date().getTime() - d.inProgress.getTime()) / (1000 * 60 * 60 * 24);
      return isNaN(age) ? 0 : age;
    });

    const maxAge = Math.max(...ages);

    const y = d3.scaleLinear()
      .domain([0, maxAge])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    // Calculate percentiles
    const percentiles = [50, 70, 85, 95];
    const percentileValues = percentiles.map(p => d3.quantile(ages, p / 100) || 0);

    // Add percentile lines
    const percentileColors = ['#15547D', '#529949', '#DFB849', '#DD4C35'];
    percentileValues.forEach((value, index) => {
      svg.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', y(value))
        .attr('y2', y(value))
        .attr('stroke', percentileColors[index])
        .attr('stroke-dasharray', '10,5');

      svg.append('text')
        .attr('x', width + 5)
        .attr('y', y(value))
        .attr('dy', '0.32em')
        .attr('fill', percentileColors[index])
        .style('font-size', '15px')
        .text(`${percentiles[index]}th (${value.toFixed(1)} days)`);
    });

    // Create tooltip (unchanged)
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(255, 255, 255, 0.9)')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '10px')
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '12px')
      .style('max-width', '250px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');

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
          const age = ((new Date().getTime() - d.inProgress.getTime()) / (1000 * 60 * 60 * 24)).toFixed(1);
          
          tooltip.html(`
            <strong style="font-size: 14px;">${d.key}</strong><br>
            <span style="color: #666;">${d.summary.length > 100 ? d.summary.substring(0, 100) + '...' : d.summary}</span><br>
            <span style="color: #0066cc; font-weight: bold;">Age: ${age} days</span>
          `)
          .style('visibility', 'visible');
        })
        .on('mousemove', (event) => {
          tooltip.style('top', (event.pageY - 10) + 'px')
                 .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', () => {
          tooltip.style('visibility', 'hidden');
        });
    });

  }, [workItems]);

  return <svg ref={chartRef}></svg>;
};

export default AgingChart;