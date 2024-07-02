import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CycleTimeItem } from '../types/CycleTimeItem';

interface CycleTimeChartProps {
  cycleTimeItems: CycleTimeItem[];
  filename: string;
}

const CycleTimeChart: React.FC<CycleTimeChartProps> = ({ cycleTimeItems, filename }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (cycleTimeItems.length === 0) return;

    const margin = { top: 80, right: 120, bottom: 50, left: 60 };
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
      .text('Cycle Time Scatterplot');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2 + 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(`Data as of ${formattedDate}`);

    // Set up scales
    const x = d3.scaleTime()
      .domain(d3.extent(cycleTimeItems, d => d.closed) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(cycleTimeItems, d => d.cycleTime) as number])
      .range([height, 0]);

    // Add X and Y axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%d %b') as any));

    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `${d}d`));

    // Add X and Y axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .text('Completion Date');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 20)
      .attr('text-anchor', 'middle')
      .text('Cycle Time (days)');

    // Calculate percentiles
    const percentiles = [50, 70, 85, 95];
    const percentileValues = percentiles.map(p => d3.quantile(cycleTimeItems.map(d => d.cycleTime), p / 100) || 0);

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

    // Color scale for issue types
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['Story', 'Bug', 'Task'])
      .range(['green', 'red', 'blue'])
      .unknown('gray');  // This will assign gray to any unknown issue types

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('padding', '10px')
      .style('border-radius', '4px');

    // Add dots
    svg.selectAll('.dot')
      .data(cycleTimeItems)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.closed))
      .attr('cy', d => y(d.cycleTime))
      .attr('r', 5)
      .attr('fill', d => colorScale(d.issueType))
      .on('mouseover', (event, d) => {
        tooltip.html(`
          <strong>${d.key}</strong><br>
          ${d.summary}<br>
          Cycle Time: ${d.cycleTime.toFixed(1)} days<br>
          Issue Type: ${d.issueType}
        `)
        .style('visibility', 'visible')
        .style('top', (event.pageY - 10) + 'px')
        .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 100}, -60)`);

    ['Story', 'Bug', 'Task'].forEach((type, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('circle')
        .attr('r', 5)
        .attr('fill', colorScale(type));

      legendItem.append('text')
        .attr('x', 10)
        .attr('y', 5)
        .text(type)
        .style('font-size', '12px')
        .attr('alignment-baseline', 'middle');
    });

  }, [cycleTimeItems, filename]);

  return <svg ref={chartRef}></svg>;
};

export default CycleTimeChart;