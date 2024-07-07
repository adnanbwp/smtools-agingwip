import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CycleTimeItem } from '../types/CycleTimeItem';

interface CycleTimeChartStandupProps {
  cycleTimeItems: CycleTimeItem[];
  filename: string;
  selectedIssueTypes: string[];
  selectedPercentiles: number[];
  percentileValues: number[];
}

const CycleTimeChartStandup: React.FC<CycleTimeChartStandupProps> = ({ 
  cycleTimeItems, 
  filename, 
  selectedIssueTypes,
  selectedPercentiles,
  percentileValues
}) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    renderChart();
  }, [cycleTimeItems, filename, selectedIssueTypes, selectedPercentiles, percentileValues]);

  const renderChart = () => {
    if (cycleTimeItems.length === 0) {
      // Render placeholder or message when no data is available
      d3.select(chartRef.current).selectAll("*").remove();
      const svg = d3.select(chartRef.current)
        .attr('width', 1100)
        .attr('height', 200); // Further reduced height
      
      svg.append('text')
        .attr('x', 550)
        .attr('y', 100) // Adjusted y-position
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', 'gray')
        .text('No Cycle Time data available. Please upload a CSV file.');
      
      return;
    }

    const filteredItems = cycleTimeItems.filter(item => 
      selectedIssueTypes.includes(item.issueType) &&
      item.cycleTime >= 1 &&
      !isNaN(item.cycleTime) &&
      item.inProgress instanceof Date &&
      item.closed instanceof Date
    );

    if (filteredItems.length === 0) {
      d3.select(chartRef.current).selectAll("*").remove();
      const svg = d3.select(chartRef.current)
        .attr('width', 1100)
        .attr('height', 200); // Further reduced height
      
      svg.append('text')
        .attr('x', 550)
        .attr('y', 100) // Adjusted y-position
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', 'gray')
        .text('No data available for selected issue types.');
      
      return;
    }

    const margin = { top: 10, right: 100, bottom: 20, left: 40 }; // Adjusted margins
    const width = 1100 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom; // Further reduced height

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'white');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(filteredItems, d => d.closed) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredItems, d => d.cycleTime) as number])
      .range([height, 0]);

    // Adjust y-axis ticks to use larger intervals
    const yAxis = d3.axisLeft(y)
      .tickFormat(d => `${d}d`)
      .ticks(5); // Reduced number of ticks

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%d %b') as any).ticks(5))
      .style('font-size', '10px')
      .selectAll('text')
      .style('fill', 'black');

    g.append('g')
      .call(yAxis)
      .style('font-size', '10px')
      .selectAll('text')
      .style('fill', 'black');

    // Render percentile lines
    const percentileColors = ['#0078D4', '#33B563', '#E6B116', '#9A0900'];
    selectedPercentiles.forEach((percentile, index) => {
      const value = percentileValues[index];
      if (value !== undefined) {
        g.append('line')
          .attr('x1', 0)
          .attr('x2', width)
          .attr('y1', y(value))
          .attr('y2', y(value))
          .attr('stroke', percentileColors[index % percentileColors.length])
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3');

        g.append('text')
          .attr('x', width + 5)
          .attr('y', y(value))
          .attr('dy', '0.32em')
          .attr('fill', percentileColors[index % percentileColors.length])
          .style('font-size', '9px')
          .text(`${percentile}th (${value.toFixed(1)}d)`);
      }
    });

    const colorScale = d3.scaleOrdinal<string>()
      .domain(['Story', 'Bug', 'Task'])
      .range(['green', 'red', 'blue'])
      .unknown('gray');

    g.selectAll('.dot')
      .data(filteredItems)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.closed))
      .attr('cy', d => y(d.cycleTime))
      .attr('r', 2.5)
      .attr('fill', d => colorScale(d.issueType))
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5);

    const legend = g.append('g')
      .attr('transform', `translate(${width - 50}, 0)`);

    ['Story', 'Bug', 'Task'].forEach((type, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 12})`);

      legendItem.append('circle')
        .attr('r', 2.5)
        .attr('fill', colorScale(type));

      legendItem.append('text')
        .attr('x', 6)
        .attr('y', 3)
        .text(type)
        .style('font-size', '9px')
        .style('fill', 'black')
        .attr('alignment-baseline', 'middle');
    });
  };

  return (
    <div>
      <svg ref={chartRef}></svg>
    </div>
  );
};

export default CycleTimeChartStandup;
