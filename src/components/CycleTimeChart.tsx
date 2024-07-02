// import React, { useEffect, useRef } from 'react';
// import * as d3 from 'd3';
// import { CycleTimeItem } from '../types/CycleTimeItem';

// interface CycleTimeChartProps {
//   cycleTimeItems: CycleTimeItem[];
//   filename: string;
// }

// const CycleTimeChart: React.FC<CycleTimeChartProps> = ({ cycleTimeItems, filename }) => {
//   const chartRef = useRef<SVGSVGElement | null>(null);

//   useEffect(() => {
//     if (cycleTimeItems.length === 0) return;

//     const margin = { top: 100, right: 120, bottom: 50, left: 60 };
//     const width = 1100 - margin.left - margin.right;
//     const height = 620 - margin.top - margin.bottom;

//     d3.select(chartRef.current).selectAll("*").remove();

//     const svg = d3.select(chartRef.current)
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + margin.bottom);
    
//     // Add white background
//     svg.append('rect')
//       .attr('width', '100%')
//       .attr('height', '100%')
//       .attr('fill', 'white');

//     const g = svg.append('g')
//       .attr('transform', `translate(${margin.left},${margin.top})`);

//     // Extract date from filename and format it
//     const dateMatch = filename.match(/\d{8}/);
//     let formattedDate = 'Unknown Date';
//     if (dateMatch) {
//       const date = new Date(dateMatch[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
//       formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
//     }

//     // Add title, date, and throughput count
//     g.append('text')
//       .attr('x', width / 2)
//       .attr('y', -margin.top / 2)
//       .attr('text-anchor', 'middle')
//       .style('font-size', '20px')
//       .style('font-weight', 'bold')
//       .style('fill', 'black')
//       .text('Cycle Time Scatterplot');

//     g.append('text')
//       .attr('x', width / 2)
//       .attr('y', -margin.top / 2 + 25)
//       .attr('text-anchor', 'middle')
//       .style('font-size', '14px')
//       .style('fill', 'black')
//       .text(`Data as of ${formattedDate}`);

//     g.append('text')
//       .attr('x', width / 2)
//       .attr('y', -margin.top / 2 + 50)
//       .attr('text-anchor', 'middle')
//       .style('font-size', '16px')
//       .style('fill', 'black')
//       .text(`Throughput: ${cycleTimeItems.length}`);

//     // Set up scales
//     const x = d3.scaleTime()
//       .domain(d3.extent(cycleTimeItems, d => d.closed) as [Date, Date])
//       .range([0, width]);

//     const y = d3.scaleLinear()
//       .domain([0, d3.max(cycleTimeItems, d => d.cycleTime) as number])
//       .range([height, 0]);

//     // Add X and Y axes
//     g.append('g')
//       .attr('transform', `translate(0,${height})`)
//       .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%d %b') as any))
//       .style('font-size', '12px')
//       .selectAll('text')
//       .style('fill', 'black');

//     g.append('g')
//       .call(d3.axisLeft(y).tickFormat(d => `${d}d`))
//       .style('font-size', '12px')
//       .selectAll('text')
//       .style('fill', 'black');

//     // Add X and Y axis labels
//     g.append('text')
//       .attr('x', width / 2)
//       .attr('y', height + margin.bottom - 10)
//       .attr('text-anchor', 'middle')
//       .style('font-size', '14px')
//       .style('fill', 'black')
//       .text('Completion Date');

//     g.append('text')
//       .attr('transform', 'rotate(-90)')
//       .attr('x', -height / 2)
//       .attr('y', -margin.left + 20)
//       .attr('text-anchor', 'middle')
//       .style('font-size', '14px')
//       .style('fill', 'black')
//       .text('Cycle Time (days)');

//     // Calculate percentiles
//     const percentiles = [50, 70, 85, 95];
//     const percentileValues = percentiles.map(p => d3.quantile(cycleTimeItems.map(d => d.cycleTime), p / 100) || 0);

//     // Add percentile lines
//     const percentileColors = ['#0078D4', '#33B563', '#E6B116', '#9A0900'];
//     percentileValues.forEach((value, index) => {
//       g.append('line')
//         .attr('x1', 0)
//         .attr('x2', width)
//         .attr('y1', y(value))
//         .attr('y2', y(value))
//         .attr('stroke', percentileColors[index])
//         .attr('stroke-width', 2)
//         .attr('stroke-dasharray', '5,5');

//       g.append('text')
//         .attr('x', width + 5)
//         .attr('y', y(value))
//         .attr('dy', '0.32em')
//         .attr('fill', percentileColors[index])
//         .style('font-size', '12px')
//         .style('font-weight', 'bold')
//         .text(`${percentiles[index]}th (${value.toFixed(1)} days)`);
//     });

//     // Create tooltip
//     const tooltip = d3.select('body').append('div')
//       .attr('class', 'tooltip')
//       .style('position', 'absolute')
//       .style('visibility', 'hidden')
//       .style('background-color', 'rgba(255, 255, 255, 0.9)')
//       .style('border', '1px solid #ddd')
//       .style('border-radius', '4px')
//       .style('padding', '10px')
//       .style('font-family', 'Arial, sans-serif')
//       .style('font-size', '12px')
//       .style('max-width', '250px')
//       .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');

//     // Color scale for issue types
//     const colorScale = d3.scaleOrdinal<string>()
//       .domain(['Story', 'Bug', 'Task'])
//       .range(['green', 'red', 'blue'])
//       .unknown('gray');

//     // Add dots
//     g.selectAll('.dot')
//       .data(cycleTimeItems)
//       .enter().append('circle')
//       .attr('class', 'dot')
//       .attr('cx', d => x(d.closed))
//       .attr('cy', d => y(d.cycleTime))
//       .attr('r', 5)
//       .attr('fill', d => colorScale(d.issueType))
//       .attr('stroke', '#fff')
//       .attr('stroke-width', 1.5)
//       .on('mouseover', (event, d) => {
//         tooltip.html(`
//           <strong style="font-size: 14px;">${d.key}</strong><br>
//           <span style="color: #666;">${d.summary.length > 100 ? d.summary.substring(0, 100) + '...' : d.summary}</span><br>
//           <span style="color: #0066cc; font-weight: bold;">Cycle Time: ${d.cycleTime.toFixed(1)} days</span><br>
//           <span style="color: ${colorScale(d.issueType)};">${d.issueType}</span>
//         `)
//         .style('visibility', 'visible');
//       })
//       .on('mousemove', (event) => {
//         tooltip.style('top', (event.pageY - 10) + 'px')
//                .style('left', (event.pageX + 10) + 'px');
//       })
//       .on('mouseout', () => {
//         tooltip.style('visibility', 'hidden');
//       });

//     // Add legend
//     const legend = g.append('g')
//       .attr('transform', `translate(${width - 100}, -60)`);

//     ['Story', 'Bug', 'Task'].forEach((type, i) => {
//       const legendItem = legend.append('g')
//         .attr('transform', `translate(0, ${i * 20})`);

//       legendItem.append('circle')
//         .attr('r', 5)
//         .attr('fill', colorScale(type));

//       legendItem.append('text')
//         .attr('x', 10)
//         .attr('y', 5)
//         .text(type)
//         .style('font-size', '12px')
//         .style('fill', 'black')
//         .attr('alignment-baseline', 'middle');
//     });

//   }, [cycleTimeItems, filename]);

//   const downloadChart = () => {
//     const svg = d3.select(chartRef.current);
//     const svgString = new XMLSerializer().serializeToString(svg.node()!);
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d')!;
    
//     // Set canvas size
//     const scale = 2; // Increase this for higher resolution
//     canvas.width = 1100 * scale;
//     canvas.height = 620 * scale;
//     ctx.scale(scale, scale);

//     const img = new Image();
//     img.onload = () => {
//       ctx.fillStyle = 'white';
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(img, 0, 0, 1100, 620);
//       const pngFile = canvas.toDataURL("image/png");
//       const downloadLink = document.createElement("a");
//       downloadLink.download = `CycleTimeScatterplot_${filename.replace('.csv', '')}.png`;
//       downloadLink.href = pngFile;
//       downloadLink.click();
//     };
//     img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
//   };

//   return (
//     <div>
//       <svg ref={chartRef}></svg>
//       <button onClick={downloadChart} style={{marginTop: '10px'}}>Download Chart</button>
//     </div>
//   );
// };

// export default CycleTimeChart;

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
      .text('Cycle Time Scatterplot');

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

    const filteredItems = cycleTimeItems.filter(d => d.cycleTime >= 0);

    const x = d3.scaleTime()
      .domain(d3.extent(filteredItems, d => d.closed) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredItems, d => d.cycleTime) as number])
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
    const percentileValues = percentiles.map(p => d3.quantile(filteredItems.map(d => d.cycleTime), p / 100) || 0);

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
      .attr('r', 5)
      .attr('fill', d => colorScale(d.issueType))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .on('mouseover', (event, d) => {
        tooltip.html(`
          <strong style="font-size: 14px;">${d.key}</strong><br>
          <span style="color: #666;">${d.summary.length > 100 ? d.summary.substring(0, 100) + '...' : d.summary}</span><br>
          <span style="color: #0066cc; font-weight: bold;">Cycle Time: ${d.cycleTime.toFixed(1)} days</span><br>
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

  }, [cycleTimeItems, filename]);

  const downloadChart = () => {
    const svg = d3.select(chartRef.current);
    const svgString = new XMLSerializer().serializeToString(svg.node()!);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const scale = 2;
    canvas.width = 1100 * scale;
    canvas.height = 620 * scale;
    ctx.scale(scale, scale);

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 1100, 620);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `CycleTimeScatterplot_${filename.replace('.csv', '')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
  };

  return (
    <div>
      <svg ref={chartRef}></svg>
      <button onClick={downloadChart} style={{marginTop: '10px'}}>Download Chart</button>
    </div>
  );
};

export default CycleTimeChart;
