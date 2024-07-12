import React, { ChangeEvent, useState } from 'react';
import { WorkItem } from '../types/WorkItem';
import { CycleTimeItem } from '../types/CycleTimeItem';
import Papa from 'papaparse';

interface FileUploadProps {
  onDataLoaded: (items: WorkItem[] | CycleTimeItem[], filename: string, type: 'aging' | 'cycleTime') => void;
}

interface CSVRow {
  Key: string;
  Summary: string;
  'Story Points': string;
  'Issue Type': string;
  Status: string;
  'In Progress': string;
  Closed?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  };

  const parseCSV = (text: string): WorkItem[] | CycleTimeItem[] => {
    const result = Papa.parse<CSVRow>(text, { header: true, skipEmptyLines: true });
    const isCycleTimeData = result.data[0] && 'Closed' in result.data[0];

    if (isCycleTimeData) {
      return result.data
        .map((row): CycleTimeItem | null => {
          const inProgress = parseDate(row['In Progress']);
          const closed = parseDate(row['Closed'] || '');
          
          if (!inProgress || !closed) return null;

          const cycleTime = Math.max(1, (closed.getTime() - inProgress.getTime()) / (1000 * 60 * 60 * 24));
          
          if (isNaN(cycleTime)) return null;

          return {
            Key: row['Key'],
            Summary: row['Summary'],
            'Story Points': row['Story Points'],
            'Issue Type': row['Issue Type'],
            Status: row['Status'],
            inProgress,
            closed,
            cycleTime
          };
        })
        .filter((item): item is CycleTimeItem => item !== null);
    } else {
      return result.data
        .map((row): WorkItem | null => {
          const inProgress = parseDate(row['In Progress']);
          if (!inProgress) return null;
          return {
            Key: row['Key'],
            Summary: row['Summary'],
            'Story Points': row['Story Points'],
            Status: row['Status'],
            inProgress,
            'Issue Type': row['Issue Type'],
          };
        })
        .filter((item): item is WorkItem => item !== null);
    }
  };

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          const parsedItems = parseCSV(text);
          const type = 'cycleTime' in parsedItems[0] ? 'cycleTime' : 'aging';
          console.log("Detected file type:", type);
          onDataLoaded(parsedItems, file.name, type);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
    </div>
  );
};

export default FileUpload;