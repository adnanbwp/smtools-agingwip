import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CycleTimeItem } from '../types/CycleTimeItem';

interface CycleTimeChartStandaloneProps {
  cycleTimeItems: CycleTimeItem[];
  filename: string;
}

const CycleTimeChartStandalone: React.FC<CycleTimeChartStandaloneProps> = ({ cycleTimeItems, filename }) => {
  console.log('CycleTimeChartStandalone rendered with', cycleTimeItems.length, 'cycle time items');
  const chartRef = useRef<SVGSVGElement | null>(null);
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>(['Story', 'Bug']);

  useEffect(() => {
    console.log('CycleTimeChartStandalone useEffect triggered');
    console.log('cycleTimeItems:', cycleTimeItems);
    console.log('filename:', filename);
    console.log('Unique issue types:', [...new Set(cycleTimeItems.map(item => item['Issue Type']))]);

    if (cycleTimeItems.length === 0) {
      console.log('No cycle time items to display');
      return;
    }
    renderChart();

    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };

  }, [cycleTimeItems, filename, selectedIssueTypes]);

  const calculateCycleTime = (inProgress: Date, closed: Date): number => {
    return Math.max(1, (closed.getTime() - inProgress.getTime()) / (1000 * 60 * 60 * 24));
  };

  const renderChart = () => {
    console.log('Rendering chart');
    const filteredItems = cycleTimeItems
      .filter(item => selectedIssueTypes.includes(item['Issue Type']))
      .map(item => ({
        ...item,
        calculatedCycleTime: calculateCycleTime(item.inProgress, item.closed)
      }));
    
    // Debug log for cycle times
    filteredItems.forEach(item => {
      console.log(`Item ${item.Key}: inProgress=${item.inProgress}, closed=${item.closed}, cycleTime=${item.cycleTime}, calculatedCycleTime=${item.calculatedCycleTime}`);
    });

    console.log('Filtered items:', filteredItems);

    if (filteredItems.length === 0) {
      console.log('No items to display after filtering');
      return;
    }

    const margin = { top: 100, right: 120, bottom: 50, left: 60 };
    const width = 1100 - margin.left - margin.right;
    const height = 620 - margin.top - margin.bottom;

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

    const dateMatch = filename.match(/\d{8}/);
    let formattedDate = 'Unknown Date';
    if (dateMatch) {
      const date = new Date(dateMatch[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    g.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .style('fill', 'black')
      .text('Historical Days To Done');

    g.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2 + 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text(`Data as of ${formattedDate}`);

    g.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2 + 50)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('fill', 'black')
      .text(`Throughput: ${cycleTimeItems.length}`);

    const x = d3.scaleTime()
      .domain(d3.extent(filteredItems, d => d.closed) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredItems, d => d.calculatedCycleTime) as number])
      .range([height, 0]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%d %b') as any))
      .style('font-size', '12px')
      .selectAll('text')
      .style('fill', 'black');

    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `${d}d`))
      .style('font-size', '12px')
      .selectAll('text')
      .style('fill', 'black');

    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('Completion Date');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('Cycle Time (days)');

    const percentiles = [50, 70, 85, 95];
    const percentileValues = percentiles.map(p => {
      const sortedCycleTimes = filteredItems.map(d => d.calculatedCycleTime).sort((a, b) => a - b);
      const index = Math.floor((p / 100) * sortedCycleTimes.length);
      return sortedCycleTimes[index];
    });

    const percentileColors = ['#0078D4', '#33B563', '#E6B116', '#9A0900'];
    percentileValues.forEach((value, index) => {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', y(value))
        .attr('y2', y(value))
        .attr('stroke', percentileColors[index])
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      g.append('text')
        .attr('x', width + 5)
        .attr('y', y(value))
        .attr('dy', '0.32em')
        .attr('fill', percentileColors[index])
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(`${percentiles[index]}th (${value.toFixed(1)} days)`);
    });

    const colorScale = d3.scaleOrdinal<string>()
      .domain(['Story', 'Bug', 'Task'])
      .range(['green', 'red', 'blue'])
      .unknown('gray');

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
      .attr('cy', d => y(d.calculatedCycleTime))
      .attr('r', 5)
      .attr('fill', d => colorScale(d['Issue Type']))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .on('mouseover', (event, d) => {
        tooltip.html(`
          <strong style="font-size: 14px;">${d.Key}</strong><br>
          <span style="color: #666;">${d.Summary.length > 100 ? d.Summary.substring(0, 100) + '...' : d.Summary}</span><br>
          <span style="color: #0066cc; font-weight: bold;">Cycle Time: ${d.calculatedCycleTime.toFixed(1)} days</span><br>
          <span style="color: ${colorScale(d['Issue Type'])};">${d['Issue Type']}</span>
        `)
        .style('visibility', 'visible')
        .style('top', (event.pageY - 10) + 'px')
        .style('left', (event.pageX + 10) + 'px');
      })
      .on('mousemove', (event) => {
        tooltip.style('top', (event.pageY - 10) + 'px')
               .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    const legend = g.append('g')
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
        .style('fill', 'black')
        .attr('alignment-baseline', 'middle');
    });
  };

  const handleIssueTypeChange = (issueType: string) => {
    setSelectedIssueTypes(prev => 
      prev.includes(issueType) 
        ? prev.filter(type => type !== issueType)
        : [...prev, issueType]
    );
  };

  const uniqueIssueTypes = [...new Set(cycleTimeItems.map(item => item['Issue Type']))];

  return (
    <div>
      <div>
        {uniqueIssueTypes.map(type => (
          <label key={type} style={{ marginRight: '10px' }}>
            <input
              type="checkbox"
              checked={selectedIssueTypes.includes(type)}
              onChange={() => handleIssueTypeChange(type)}
            />
            {type}
          </label>
        ))}
      </div>
      <svg ref={chartRef}></svg>
    </div>
  );
};

export default CycleTimeChartStandalone;