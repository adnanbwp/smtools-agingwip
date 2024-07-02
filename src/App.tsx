import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AgingChart from './components/AgingChart';
import CycleTimeChart from './components/CycleTimeChart';
import { WorkItem } from './types/WorkItem';
import { CycleTimeItem } from './types/CycleTimeItem';

const App: React.FC = () => {
  const [agingWorkItems, setAgingWorkItems] = useState<WorkItem[]>([]);
  const [cycleTimeItems, setCycleTimeItems] = useState<CycleTimeItem[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [dataType, setDataType] = useState<'aging' | 'cycleTime' | null>(null);

  const handleDataLoaded = (items: WorkItem[] | CycleTimeItem[], name: string, type: 'aging' | 'cycleTime') => {
  console.log("Data loaded. Type:", type, "Items:", items);
  setFilename(name);
  setDataType(type);
  if (type === 'aging') {
    setAgingWorkItems(items as WorkItem[]);
    setCycleTimeItems([]);
  } else {
    setCycleTimeItems(items as CycleTimeItem[]);
    setAgingWorkItems([]);
  }
};

  return (
  <div style={{ padding: '20px' }}>
    <h1>Work Item Analysis</h1>
    <FileUpload onDataLoaded={handleDataLoaded} />
    {dataType === 'aging' && agingWorkItems.length > 0 && (
      <div style={{ marginTop: '20px' }}>
        <h2>Aging Work In Progress Chart</h2>
        <AgingChart workItems={agingWorkItems} filename={filename} />
      </div>
    )}
    {dataType === 'cycleTime' && cycleTimeItems.length > 0 && (
      <div style={{ marginTop: '20px' }}>
        <h2>Cycle Time Scatterplot</h2>
        <CycleTimeChart cycleTimeItems={cycleTimeItems} filename={filename} />
      </div>
    )}
    {(!dataType || (dataType === 'aging' && agingWorkItems.length === 0) || (dataType === 'cycleTime' && cycleTimeItems.length === 0)) && (
      <div>No valid data loaded</div>
    )}
  </div>
  );
};

export default App;