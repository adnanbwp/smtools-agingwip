import React, { useState, useEffect, useMemo } from 'react';
import { WorkItem } from '../types/WorkItem';
import { CycleTimeItem } from '../types/CycleTimeItem';
import AgingChartStandup from './AgingChartStandup';
import CycleTimeChartStandup from './CycleTimeChartStandup';

interface StandupViewProps {
  workItems: WorkItem[];
  cycleTimeItems: CycleTimeItem[];
  agingFilename: string;
  cycleTimeFilename: string;
}

const issueTypeColors = {
  'Story': 'green',
  'Bug': 'red',
  'Task': 'blue'
};

const StandupView: React.FC<StandupViewProps> = ({ 
  workItems, 
  cycleTimeItems, 
  agingFilename,
  cycleTimeFilename
}) => {
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>([]);
  const [selectedPercentiles, setSelectedPercentiles] = useState<number[]>([50, 70, 85, 95]);

  const allIssueTypes = useMemo(() => {
    const types = new Set([
      ...workItems.map(item => item['Issue Type']),
      ...cycleTimeItems.map(item => item['Issue Type'])
    ]);
    return Array.from(types);
  }, [workItems, cycleTimeItems]);

  useEffect(() => {
    setSelectedIssueTypes(allIssueTypes);
  }, [allIssueTypes]);

  const handleIssueTypeChange = (issueType: string) => {
    setSelectedIssueTypes(prev => 
      prev.includes(issueType) 
        ? prev.filter(type => type !== issueType)
        : [...prev, issueType]
    );
  };

  const handlePercentileChange = (percentile: number) => {
    setSelectedPercentiles(prev => 
      prev.includes(percentile) 
        ? prev.filter(p => p !== percentile)
        : [...prev, percentile].sort((a, b) => a - b)
    );
  };

  const calculateCycleTime = (inProgress: Date, closed: Date): number => {
    return Math.max(1, Math.ceil((closed.getTime() - inProgress.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const cycleTimeItemsWithCalculatedTime = useMemo(() => {
    return cycleTimeItems.map(item => ({
      ...item,
      cycleTime: calculateCycleTime(item.inProgress, item.closed)
    }));
  }, [cycleTimeItems]);

  const calculatePercentileValues = (items: CycleTimeItem[]): number[] => {
    const filteredItems = items.filter(item => 
      selectedIssueTypes.includes(item['Issue Type']) &&
      item.cycleTime !== undefined &&
      item.cycleTime >= 1
    );
    const cycleTimes = filteredItems.map(item => item.cycleTime!).sort((a, b) => a - b);
    console.log('Filtered cycle times:', cycleTimes);
    return selectedPercentiles.map(percentile => {
      const index = Math.floor((percentile / 100) * cycleTimes.length);
      return cycleTimes[index] || 0;
    });
  };

  const percentileValues = useMemo(() => calculatePercentileValues(cycleTimeItemsWithCalculatedTime), [cycleTimeItemsWithCalculatedTime, selectedIssueTypes, selectedPercentiles]);

  const filteredWorkItems = workItems.filter(item => selectedIssueTypes.includes(item['Issue Type']));

  console.log('Percentile values:', percentileValues);

  return (
    <div style={{ display: 'flex', height: '100vh', padding: '20px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 3, marginBottom: '20px' }}>
          <AgingChartStandup 
            workItems={filteredWorkItems} 
            filename={agingFilename} 
            selectedIssueTypes={selectedIssueTypes}
            selectedPercentiles={selectedPercentiles}
            percentileValues={percentileValues}
            issueTypeColors={issueTypeColors}
          />
        </div>
        <div style={{ flex: 2 }}>
          <CycleTimeChartStandup 
            cycleTimeItems={cycleTimeItemsWithCalculatedTime} 
            filename={cycleTimeFilename}
            selectedIssueTypes={selectedIssueTypes}
            selectedPercentiles={selectedPercentiles}
            percentileValues={percentileValues}
            issueTypeColors={issueTypeColors}
          />
        </div>
      </div>
      <div style={{ width: '250px', marginLeft: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Control Panel</h3>
        <div>
          <h4>Issue Types</h4>
          {allIssueTypes.map(type => (
            <label key={type} style={{ display: 'block', marginBottom: '5px', color: issueTypeColors[type as keyof typeof issueTypeColors] || 'black' }}>
              <input
                type="checkbox"
                checked={selectedIssueTypes.includes(type)}
                onChange={() => handleIssueTypeChange(type)}
              />
              {type}
            </label>
          ))}
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4>Percentiles</h4>
          {[50, 70, 85, 95].map(percentile => (
            <label key={percentile} style={{ display: 'block', marginBottom: '5px' }}>
              <input
                type="checkbox"
                checked={selectedPercentiles.includes(percentile)}
                onChange={() => handlePercentileChange(percentile)}
              />
              {percentile}th
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StandupView;