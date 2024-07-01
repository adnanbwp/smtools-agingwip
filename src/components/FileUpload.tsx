import React, { ChangeEvent, useState } from 'react';
import { WorkItem } from '../types/WorkItem';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string): WorkItem[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const item: WorkItem = {
        key: values[headers.indexOf('Key')],
        summary: values[headers.indexOf('Summary')],
        status: values[headers.indexOf('Status')],
        inProgress: new Date(values[headers.indexOf('In Progress')].split('/').reverse().join('-')),
      };
      const storyPoints = values[headers.indexOf('Story Points')];
      if (storyPoints) {
        item.storyPoints = parseInt(storyPoints, 10);
      }
      return item;
    });
  };

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsedItems = parseCSV(text);
        setWorkItems(parsedItems);
        console.log(parsedItems); // For now, just log the parsed items
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