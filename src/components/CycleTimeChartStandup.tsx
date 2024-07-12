import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CycleTimeItem } from '../types/CycleTimeItem';

interface CycleTimeChartStandupProps {
  cycleTimeItems: CycleTimeItem[];
  filename: string;
  selectedIssueTypes: string[];
  selectedPercentiles: number[];
  percentileValues: number[];
  issueTypeColors: { [key: string]: string };
}

const CycleTimeChartStandup: React.FC<CycleTimeChartStandupProps> = ({ 
  cycleTimeItems, 
  filename, 
  selectedIssueTypes,
  selectedPercentiles,
  percentileValues,
  issueTypeColors
}) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (cycleTimeItems.length === 0) return;
    renderChart();
  }, [cycleTimeItems, filename, selectedIssueTypes, selectedPercentiles, percentileValues]);

  const renderChart = () => {
    console.log('Rendering CycleTimeChartStandup');
    console.log('cycleTimeItems:', cycleTimeItems);
    console.log('selectedIssueTypes:', selectedIssueTypes);

    const filteredItems = cycleTimeItems.filter(item => 
      selectedIssueTypes.includes(item['Issue Type']) &&
      item.cycleTime !== undefined &&
      item.cycleTime >= 1 &&
      item.inProgress instanceof Date &&
      item.closed instanceof Date
    );

    console.log('Filtered items:', filteredItems);

    if (filteredItems.length === 0) {
      console.log('No items to display after filtering');
      return;
    }

    const margin = { top: 40, right: 80, bottom: 30, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(filteredItems, d => d.closed) as [Date, Date])
      .range([0, width]);

    const maxYValue = Math.max(30, d3.max(filteredItems, d => d.cycleTime) || 0);
    const y = d3.scaleLinear()
      .domain([0, maxYValue])
      .range([height, 0]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat((d: Date | d3.NumberValue) => {
        if (d instanceof Date) {
          return d3.timeFormat('%d %b')(d);
        }
        return '';
      }));

    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `${d}d`));

    const percentileColors = ['#0078D4', '#33B563', '#E6B116', '#9A0900'];
    selectedPercentiles.forEach((percentile, index) => {
      const value = percentileValues[index];
      if (value <= maxYValue) {
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

    g.selectAll('.dot')
      .data(filteredItems)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.closed))
      .attr('cy', d => y(Math.min(d.cycleTime!, maxYValue)))
      .attr('r', 3)
      .attr('fill', d => issueTypeColors[d['Issue Type']] || 'gray')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', (event, d) => {
        tooltip.html(`
          <strong style="font-size: 14px;">${d.Key}</strong><br>
          <span style="color: #666;">${d.Summary.length > 100 ? d.Summary.substring(0, 100) + '...' : d.Summary}</span><br>
          <span style="color: #0066cc; font-weight: bold;">Cycle Time: ${d.cycleTime!.toFixed(1)} days</span><br>
          <span style="color: ${issueTypeColors[d['Issue Type']]};">${d['Issue Type']}</span>
        `)
        .style('visibility', 'visible')
        .style('top', (event.pageY - 10) + 'px')
        .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', 'black')
      .text('Cycle Time Scatterplot');
    // Add date
    const dateMatch = filename.match(/\d{8}/);
    if (dateMatch) {
      const date = new Date(dateMatch[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      g.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2 + 25)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', 'black')
        .text(`Data as of ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
    }
      g.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2 + 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', 'black')
        .text(`Throughput: ${cycleTimeItems.length}`);
  };

  return (
    <div>
      <svg ref={chartRef}></svg>
    </div>
  );
};

export default CycleTimeChartStandup;