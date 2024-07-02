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

  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const parseCSV = (text: string): WorkItem[] | CycleTimeItem[] => {
    const result = Papa.parse<CSVRow>(text, { header: true, skipEmptyLines: true });
    const isCycleTimeData = result.data[0] && 'Closed' in result.data[0];

    if (isCycleTimeData) {
      return result.data.map((row): CycleTimeItem => ({
        key: row['Key'],
        summary: row['Summary'],
        storyPoints: row['Story Points'] ? parseInt(row['Story Points'], 10) : undefined,
        issueType: row['Issue Type'],
        status: row['Status'],
        inProgress: parseDate(row['In Progress']),
        closed: parseDate(row['Closed'] || ''),
        cycleTime: (parseDate(row['Closed'] || '').getTime() - parseDate(row['In Progress']).getTime()) / (1000 * 60 * 60 * 24)
      }));
    } else {
      return result.data.map((row): WorkItem => ({
        key: row['Key'],
        summary: row['Summary'],
        storyPoints: row['Story Points'] ? parseInt(row['Story Points'], 10) : undefined,
        status: row['Status'],
        inProgress: parseDate(row['In Progress']),
        issueType: row['Issue Type'],
      }));
    }
  };

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          const parsedItems = parseCSV(text);
          const type = 'closed' in parsedItems[0] ? 'cycleTime' : 'aging';
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