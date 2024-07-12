import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { WorkItem } from '../types/WorkItem';

interface AgingChartStandupProps {
  workItems: WorkItem[];
  filename: string;
  selectedIssueTypes: string[];
  selectedPercentiles: number[];
  percentileValues: number[];
  issueTypeColors: { [key: string]: string };
}

const AgingChartStandup: React.FC<AgingChartStandupProps> = ({ 
  workItems, 
  filename, 
  selectedIssueTypes,
  selectedPercentiles,
  percentileValues,
  issueTypeColors
}) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (workItems.length === 0) return;
    renderChart();
  }, [workItems, filename, selectedIssueTypes, selectedPercentiles, percentileValues]);

  const renderChart = () => {
    const margin = { top: 60, right: 120, bottom: 50, left: 60 };
    const width = 1100 - margin.left - margin.right;
    const height = 620 - margin.top - margin.bottom;

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', 'black')
      .text('Aging Work In Progress Chart');

    // Add date
    const dateMatch = filename.match(/\d{8}/);
    if (dateMatch) {
      const date = new Date(dateMatch[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      g.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2 + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', 'black')
        .text(`Data as of ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
    }

    // Add WIP count
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2 + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
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

    const y = d3.scaleLinear()
      .domain([0, d3.max(ages) || 0])
      .range([height, 0]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `${d}d`));

    const percentileColors = ['#0078D4', '#33B563', '#E6B116', '#9A0900'];
    selectedPercentiles.forEach((percentile, index) => {
      const value = percentileValues[index];
      g.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', y(value))
        .attr('y2', y(value))
        .attr('stroke', percentileColors[index % percentileColors.length])
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      g.append('text')
        .attr('x', width + 5)
        .attr('y', y(value))
        .attr('dy', '0.32em')
        .attr('fill', percentileColors[index % percentileColors.length])
        .style('font-size', '12px')
        .text(`${percentile}th (${value.toFixed(1)}d)`);
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

    statuses.forEach(status => {
      const statusItems = workItems.filter(item => item.Status === status);
      
      g.selectAll(`.dot-${status}`)
        .data(statusItems)
        .enter().append('circle')
        .attr('class', `dot-${status}`)
        .attr('cx', x(status)! + x.bandwidth() / 2)
        .attr('cy', d => {
          const age = (new Date().getTime() - d.inProgress.getTime()) / (1000 * 60 * 60 * 24);
          return isNaN(age) ? y(0) : y(age);
        })
        .attr('r', 5)
        .attr('fill', d => issueTypeColors[d['Issue Type']])
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .on('mouseover', (event, d) => {
          const age = ((new Date().getTime() - d.inProgress.getTime()) / (1000 * 60 * 60 * 24)).toFixed(1);
          
          tooltip.html(`
            <strong style="font-size: 14px;">${d.Key}</strong><br>
            <span style="color: #666;">${d.Summary.length > 100 ? d.Summary.substring(0, 100) + '...' : d.Summary}</span><br>
            <span style="color: #0066cc; font-weight: bold;">Age: ${age} days</span><br>
            <span style="color: ${issueTypeColors[d['Issue Type']]};">${d['Issue Type']}</span>
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
  };

  return (
    <div>
      <svg ref={chartRef}></svg>
    </div>
  );
};

export default AgingChartStandup;