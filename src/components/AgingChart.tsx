import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { WorkItem } from '../types/WorkItem';

interface AgingChartProps {
  workItems: WorkItem[];
  filename: string;
}

const AgingChart: React.FC<AgingChartProps> = ({ workItems, filename }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (workItems.length === 0) return;

    const margin = { top: 100, right: 120, bottom: 50, left: 60 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Extract date from filename and format it
    const dateMatch = filename.match(/\d{8}/);
    let formattedDate = 'Unknown Date';
    if (dateMatch) {
      const date = new Date(dateMatch[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // Add title and date
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .style('fill', 'currentColor')
      .text('Aging Work In Progress Chart');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2 + 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'currentColor')
      .text(`Data as of ${formattedDate}`);
    
    svg.append('text')
      .attr( 'x', width / 2)
      .attr('y', -margin.top / 2 + 50)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('fill', 'currentColor')
      .text(`WIP: ${workItems.length}`);

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

    // Add styled X and Y axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .style('font-size', '12px')
      .call(g => g.select('.domain').attr('stroke-width', 2));

    svg.append('g')
      .call(d3.axisLeft(y))
      .style('font-size', '12px')
      .call(g => g.select('.domain').attr('stroke-width', 2));

    // Add X axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'currentColor')
      .text('Status');

    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'currentColor')
      .text('Age (days)');

    // Calculate percentiles
    const percentiles = [50, 70, 85, 95];
    const percentileValues = percentiles.map(p => d3.quantile(ages, p / 100) || 0);

    // Add percentile lines
    const percentileColors = ['#0078D4', '#33B563', '#E6B116', '#9A0900'];
    percentileValues.forEach((value, index) => {
      svg.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', y(value))
        .attr('y2', y(value))
        .attr('stroke', percentileColors[index])
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      svg.append('text')
        .attr('x', width + 5)
        .attr('y', y(value))
        .attr('dy', '0.32em')
        .attr('fill', percentileColors[index])
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(`${percentiles[index]}th (${value.toFixed(1)} days)`);
    });

    // Create tooltip
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

    // Color scale for issue types
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['Story', 'Bug', 'Task'])
      .range(['green', 'red', 'blue'])
      .unknown('gray');  // This will assign gray to any unknown issue types

    // Add dots
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
        .attr('r', 6)
        .attr('fill', d => colorScale(d.issueType))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .on('mouseover', (event, d) => {
          const age = ((new Date().getTime() - d.inProgress.getTime()) / (1000 * 60 * 60 * 24)).toFixed(1);
          
          tooltip.html(`
            <strong style="font-size: 14px;">${d.key}</strong><br>
            <span style="color: #666;">${d.summary.length > 100 ? d.summary.substring(0, 100) + '...' : d.summary}</span><br>
            <span style="color: #0066cc; font-weight: bold;">Age: ${age} days</span><br>
            <span style="color: ${colorScale(d.issueType)};">${d.issueType}</span>
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

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 100}, -60)`);

    ['Story', 'Bug', 'Task'].forEach((type, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('circle')
        .attr('r', 6)
        .attr('fill', colorScale(type));

      legendItem.append('text')
        .attr('x', 10)
        .attr('y', 4)
        .text(type)
        .style('font-size', '12px')
        .style('fill', 'currentColor')
        .attr('alignment-baseline', 'middle');
    });

  }, [workItems, filename]);

  return <svg ref={chartRef}></svg>;
};

export default AgingChart;