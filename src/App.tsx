import React, { useState } from 'react';
import Home from './components/Home';
import StandaloneView from './components/StandaloneView';
import StandupView from './components/StandupView';
import { HelpComponent } from './components/HelpComponent';
import { WorkItem } from './types/WorkItem';
import { CycleTimeItem } from './types/CycleTimeItem';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'standalone' | 'standup'>('home');
  const [agingWorkItems, setAgingWorkItems] = useState<WorkItem[]>([]);
  const [cycleTimeItems, setCycleTimeItems] = useState<CycleTimeItem[]>([]);
  const [agingFilename, setAgingFilename] = useState<string>('');
  const [cycleTimeFilename, setCycleTimeFilename] = useState<string>('');

  const handleDataLoaded = (type: 'aging' | 'cycleTime', items: WorkItem[] | CycleTimeItem[], filename: string) => {
    console.log(`Data loaded for ${type}:`, items);
    console.log(`Filename: ${filename}`);
    if (type === 'aging') {
      setAgingWorkItems(items as WorkItem[]);
      setAgingFilename(filename);
    } else {
      setCycleTimeItems(items as CycleTimeItem[]);
      setCycleTimeFilename(filename);
    }
  };

  const handleNavigate = (newView: 'standalone' | 'standup') => {
    setView(newView);
  };

  const handleRemoveData = (type: 'aging' | 'cycleTime') => {
    if (type === 'aging') {
      setAgingWorkItems([]);
      setAgingFilename('');
    } else {
      setCycleTimeItems([]);
      setCycleTimeFilename('');
    }
  };

  return (
    <div>
      <HelpComponent />
      {view === 'home' && (
        <Home
          onDataLoaded={handleDataLoaded}
          onNavigate={handleNavigate}
          onRemoveData={handleRemoveData}
          agingWorkItems={agingWorkItems}
          cycleTimeItems={cycleTimeItems}
        />
      )}
      {view === 'standalone' && (
        <StandaloneView
          agingWorkItems={agingWorkItems}
          cycleTimeItems={cycleTimeItems}
          agingFilename={agingFilename}
          cycleTimeFilename={cycleTimeFilename}
        />
      )}
      {view === 'standup' && (
        <StandupView
          workItems={agingWorkItems}
          cycleTimeItems={cycleTimeItems}
          agingFilename={agingFilename}
          cycleTimeFilename={cycleTimeFilename}
        />
      )}
      {view !== 'home' && (
        <button onClick={() => setView('home')}>Back to Home</button>
      )}
    </div>
  );
};

export default App;