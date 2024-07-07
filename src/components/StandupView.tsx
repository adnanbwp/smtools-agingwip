import React, { useState } from 'react';
import { WorkItem } from '../types/WorkItem';
import { CycleTimeItem } from '../types/CycleTimeItem';
import AgingChartStandup from './AgingChartStandup';
import CycleTimeChartStandup from './CycleTimeChartStandup';
import FileUpload from './FileUpload';

interface StandupViewProps {
  initialAgingWorkItems: WorkItem[];
  initialCycleTimeItems: CycleTimeItem[];
  initialFilename: string;
}

const StandupView: React.FC<StandupViewProps> = ({ initialAgingWorkItems, initialCycleTimeItems, initialFilename }) => {
  const [agingWorkItems, setAgingWorkItems] = useState<WorkItem[]>(initialAgingWorkItems);
  const [cycleTimeItems, setCycleTimeItems] = useState<CycleTimeItem[]>(initialCycleTimeItems);
  const [agingFilename, setAgingFilename] = useState<string>(initialFilename);
  const [cycleTimeFilename, setCycleTimeFilename] = useState<string>(initialFilename);
  const [selectedPercentiles, setSelectedPercentiles] = useState<number[]>([50, 70, 85, 95]);
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>(['Story', 'Bug', 'Task']);

  const handleAgingDataLoaded = (items: WorkItem[], name: string) => {
    setAgingWorkItems(items);
    setAgingFilename(name);
  };

  const handleCycleTimeDataLoaded = (items: CycleTimeItem[], name: string) => {
    setCycleTimeItems(items);
    setCycleTimeFilename(name);
  };

  const handlePercentileChange = (percentile: number) => {
    setSelectedPercentiles(prev => 
      prev.includes(percentile) 
        ? prev.filter(p => p !== percentile)
        : [...prev, percentile].sort((a, b) => a - b)
    );
  };

  const handleIssueTypeChange = (issueType: string) => {
    setSelectedIssueTypes(prev => 
      prev.includes(issueType) 
        ? prev.filter(type => type !== issueType)
        : [...prev, issueType]
    );
  };

  const calculatePercentileValues = () => {
    if (cycleTimeItems.length > 0) {
      const cycleTimes = cycleTimeItems.map(item => item.cycleTime).sort((a, b) => a - b);
      return selectedPercentiles.map(percentile => {
        const index = Math.floor((percentile / 100) * cycleTimes.length);
        return cycleTimes[index];
      });
    } else if (agingWorkItems.length > 0) {
      const ages = agingWorkItems.map(item => {
        const age = (new Date().getTime() - item.inProgress.getTime()) / (1000 * 60 * 60 * 24);
        return isNaN(age) ? 0 : age;
      }).sort((a, b) => a - b);
      return selectedPercentiles.map(percentile => {
        const index = Math.floor((percentile / 100) * ages.length);
        return ages[index];
      });
    }
    return [];
  };

  const percentileValues = calculatePercentileValues();

  return (
    <div style={{ display: 'flex', height: '100vh', padding: '20px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 2, marginBottom: '20px', border: '1px solid #ccc' }}>
          <AgingChartStandup 
            workItems={agingWorkItems} 
            filename={agingFilename} 
            selectedPercentiles={selectedPercentiles}
            percentileValues={percentileValues}
            selectedIssueTypes={selectedIssueTypes}
          />
        </div>
        <div style={{ flex: 1, border: '1px solid #ccc' }}>
          <CycleTimeChartStandup 
            cycleTimeItems={cycleTimeItems} 
            filename={cycleTimeFilename}
            selectedPercentiles={selectedPercentiles}
            percentileValues={percentileValues}
            selectedIssueTypes={selectedIssueTypes}
          />
        </div>
      </div>
      <div style={{ width: '300px', marginLeft: '20px', border: '0px solid #ccc', padding: '10px' }}>
        <h2>Control Panel</h2>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '5px', 
          padding: '10px' 
        }}>
          <section>
            <h3>Upload Aging WIP CSV</h3>
            <FileUpload onDataLoaded={(items, name) => handleAgingDataLoaded(items as WorkItem[], name)} />
          </section>
          
          <hr style={{ width: '100%', margin: '10px 0' }} />
          
          <section>
            <h3>Upload Cycle Time CSV</h3>
            <FileUpload onDataLoaded={(items, name) => handleCycleTimeDataLoaded(items as CycleTimeItem[], name)} />
          </section>
          
          <hr style={{ width: '100%', margin: '10px 0' }} />
          
          <section>
            <h3>Percentile Lines</h3>
            {[50, 70, 85, 95].map(percentile => (
              <label key={percentile} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={selectedPercentiles.includes(percentile)}
                  onChange={() => handlePercentileChange(percentile)}
                />
                {percentile}th
              </label>
            ))}
          </section>
          
          <hr style={{ width: '100%', margin: '10px 0' }} />
          
          <section>
            <h3>Issue Types</h3>
            {['Story', 'Bug', 'Task'].map(type => (
              <label key={type} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={selectedIssueTypes.includes(type)}
                  onChange={() => handleIssueTypeChange(type)}
                />
                {type}
              </label>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

export default StandupView;