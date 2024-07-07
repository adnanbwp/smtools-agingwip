import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AgingChartStandalone from './components/AgingChartStandalone';
import CycleTimeChartStandalone from './components/CycleTimeChartStandalone';
import StandupView from './components/StandupView';
import { WorkItem } from './types/WorkItem';
import { CycleTimeItem } from './types/CycleTimeItem';

const App: React.FC = () => {
  const [agingWorkItems, setAgingWorkItems] = useState<WorkItem[]>([]);
  const [cycleTimeItems, setCycleTimeItems] = useState<CycleTimeItem[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [dataType, setDataType] = useState<'aging' | 'cycleTime' | null>(null);
  const [view, setView] = useState<'standalone' | 'standup'>('standalone');

  const handleDataLoaded = (items: WorkItem[] | CycleTimeItem[], name: string, type: 'aging' | 'cycleTime') => {
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

  const toggleView = () => {
    setView(view === 'standalone' ? 'standup' : 'standalone');
  };

  const renderStandaloneView = () => (
    <div style={{ padding: '20px' }}>
      <h1>Work Item Analysis</h1>
      <FileUpload onDataLoaded={handleDataLoaded} />
      {dataType === 'aging' && agingWorkItems.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Aging Work In Progress Chart</h2>
          <AgingChartStandalone workItems={agingWorkItems} filename={filename} />
        </div>
      )}
      {dataType === 'cycleTime' && cycleTimeItems.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Cycle Time Scatterplot</h2>
          <CycleTimeChartStandalone cycleTimeItems={cycleTimeItems} filename={filename} />
        </div>
      )}
    </div>
  );

  const renderStandupView = () => (
    <StandupView
      initialAgingWorkItems={agingWorkItems}
      initialCycleTimeItems={cycleTimeItems}
      initialFilename={filename}
    />
  );

  return (
    <div>
      <button onClick={toggleView} style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}>
        Switch to {view === 'standalone' ? 'Standup' : 'Standalone'} View
      </button>
      {view === 'standalone' ? renderStandaloneView() : renderStandupView()}
    </div>
  );
};

export default App;