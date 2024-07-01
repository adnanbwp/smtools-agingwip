import React, { ChangeEvent, useState } from 'react';
import { WorkItem } from '../types/WorkItem';
import Papa from 'papaparse';

interface FileUploadProps {
  onWorkItemsLoaded: (items: WorkItem[], filename: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onWorkItemsLoaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const parseCSV = (text: string): WorkItem[] => {
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    return result.data.map((row: any) => ({
      key: row['Key'] || '',
      summary: row['Summary'] || '',
      storyPoints: row['Story Points'] ? parseInt(row['Story Points'], 10) : undefined,
      status: row['Status'] || '',
      inProgress: row['In Progress'] ? parseDate(row['In Progress']) : new Date(),
    }));
  };

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          const parsedItems = parseCSV(text);
          setWorkItems(parsedItems);
          onWorkItemsLoaded(parsedItems, file.name);
          console.log(parsedItems); // For now, just log the parsed items
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
      {workItems.length > 0 && (
        <p>{workItems.length} work items loaded.</p>
      )}
    </div>
  );
};

export default FileUpload;