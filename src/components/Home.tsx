import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { WorkItem } from '../types/WorkItem';
import { CycleTimeItem } from '../types/CycleTimeItem';
import Papa from 'papaparse';
import { sampleAgingWipData, sampleCycleTimeData } from '../sampleData';

interface HomeProps {
  onDataLoaded: (type: 'aging' | 'cycleTime', items: WorkItem[] | CycleTimeItem[], filename: string) => void;
  onNavigate: (view: 'standalone' | 'standup') => void;
  onRemoveData: (type: 'aging' | 'cycleTime') => void;
  agingWorkItems: WorkItem[];
  cycleTimeItems: CycleTimeItem[];
}

const Home: React.FC<HomeProps> = ({ 
  onDataLoaded, 
  onNavigate, 
  onRemoveData, 
  agingWorkItems, 
  cycleTimeItems 
}) => {
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  };

  const onDrop = useCallback((acceptedFiles: File[], fileType: 'aging' | 'cycleTime') => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      Papa.parse(file, {
        complete: (results) => {
          const items = results.data
            .map((row: any) => ({
              ...row,
              inProgress: parseDate(row['In Progress']),
              ...(fileType === 'cycleTime' && { closed: parseDate(row.Closed) })
            }))
            .filter((item: any) => item.inProgress !== null);
          
          console.log(`Parsed ${fileType} data:`, items);
          onDataLoaded(fileType, items, file.name);
        },
        header: true
      });
    }
  }, [onDataLoaded]);

  const agingDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'aging'),
    accept: {
      'text/csv': ['.csv']
    }
  });

  const cycleTimeDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'cycleTime'),
    accept: {
      'text/csv': ['.csv']
    }
  });

  const handleLoadSampleData = () => {
    onDataLoaded('aging', sampleAgingWipData, 'sample-aging-wip.csv');
    onDataLoaded('cycleTime', sampleCycleTimeData, 'sample-cycle-time.csv');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Upload Your Data</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleLoadSampleData}>Load Sample Data</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '45%' }}>
          <h2>Aging WIP Data</h2>
          <div {...agingDropzone.getRootProps()} style={dropzoneStyle}>
            <input {...agingDropzone.getInputProps()} />
            <p>Drag 'n' drop Aging WIP CSV file here, or click to select file</p>
          </div>
          {agingWorkItems.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <p>{`${agingWorkItems.length} items loaded`}</p>
              <button onClick={() => onRemoveData('aging')}>Remove</button>
            </div>
          )}
        </div>
        <div style={{ width: '45%' }}>
          <h2>Cycle Time Data</h2>
          <div {...cycleTimeDropzone.getRootProps()} style={dropzoneStyle}>
            <input {...cycleTimeDropzone.getInputProps()} />
            <p>Drag 'n' drop Cycle Time CSV file here, or click to select file</p>
          </div>
          {cycleTimeItems.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <p>{`${cycleTimeItems.length} items loaded`}</p>
              <button onClick={() => onRemoveData('cycleTime')}>Remove</button>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        {agingWorkItems.length > 0 && cycleTimeItems.length > 0 && (
          <div>
            <button onClick={() => onNavigate('standalone')} style={{ marginRight: '10px' }}>Go to Standalone View</button>
            <button onClick={() => onNavigate('standup')}>Go to Standup View</button>
          </div>
        )}
        {(agingWorkItems.length > 0 || cycleTimeItems.length > 0) && !(agingWorkItems.length > 0 && cycleTimeItems.length > 0) && (
          <button onClick={() => onNavigate('standalone')}>Go to Standalone View</button>
        )}
      </div>
    </div>
  );
};

const dropzoneStyle = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center' as const,
  cursor: 'pointer'
};

export default Home;