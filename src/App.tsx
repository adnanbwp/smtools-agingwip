import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AgingChart from './components/AgingChart';
import { WorkItem } from './types/WorkItem';

const App: React.FC = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);

  const handleWorkItemsLoaded = (items: WorkItem[]) => {
    setWorkItems(items);
  };

  return (
    <div>
      <h1>Aging Work In Progress Chart</h1>
      <FileUpload onWorkItemsLoaded={handleWorkItemsLoaded} />
      {workItems.length > 0 && <AgingChart workItems={workItems} />}
    </div>
  );
};

export default App;