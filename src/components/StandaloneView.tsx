import React, { useState } from 'react';
import AgingChartStandalone from './AgingChartStandalone';
import CycleTimeChartStandalone from './CycleTimeChartStandalone';
import { WorkItem } from '../types/WorkItem';
import { CycleTimeItem } from '../types/CycleTimeItem';

interface StandaloneViewProps {
  agingWorkItems: WorkItem[];
  cycleTimeItems: CycleTimeItem[];
  agingFilename: string;
  cycleTimeFilename: string;
}

const StandaloneView: React.FC<StandaloneViewProps> = ({
  agingWorkItems,
  cycleTimeItems,
  agingFilename,
  cycleTimeFilename
}) => {
  console.log('Aging Work Items:', agingWorkItems);
  console.log('Cycle Time Items:', cycleTimeItems);
  
  const [activeChart, setActiveChart] = useState<'aging' | 'cycleTime'>('aging');

  return (
    <div>
      <div>
        <button onClick={() => setActiveChart('aging')} disabled={activeChart === 'aging'}>
          Aging Chart
        </button>
        <button onClick={() => setActiveChart('cycleTime')} disabled={activeChart === 'cycleTime'}>
          Cycle Time Chart
        </button>
      </div>
      {activeChart === 'aging' && agingWorkItems.length > 0 && (
        <AgingChartStandalone workItems={agingWorkItems} filename={agingFilename} />
      )}
      {activeChart === 'cycleTime' && cycleTimeItems.length > 0 && (
        <CycleTimeChartStandalone cycleTimeItems={cycleTimeItems} filename={cycleTimeFilename} />
      )}
    </div>
  );
};

export default StandaloneView;