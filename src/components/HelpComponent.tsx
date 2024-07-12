import React, { useState, useRef, useEffect } from 'react';

interface HelpContent {
  title: string;
  content: React.ReactNode;
}

const helpContents: HelpContent[] = [
  {
    title: 'What is this tool?',
    content: (
      <p>This tool visualizes Aging Work in Progress (WIP) and Cycle Time data to help teams track and improve their workflow efficiency.</p>
    ),
  },
  {
    title: 'Aging WIP Chart',
    content: (
      <p>The Aging WIP Chart shows the current work items in progress, their status, and how long they've been in progress.</p>
    ),
  },
  {
    title: 'Cycle Time Chart',
    content: (
      <p>The Cycle Time Chart displays how long it takes for work items to be completed, from start to finish.</p>
    ),
  },
  {
    title: 'CSV File Guidelines',
    content: (
      <div>
        <ol>
          <li>
            <strong>File Format:</strong>
            <ul>
              <li>Use CSV (Comma-Separated Values) format.</li>
              <li>Ensure the file has a .csv extension.</li>
            </ul>
          </li>
          <li>
            <strong>File Naming:</strong>
            <ul>
              <li>Name your file using the date format: YYYYMMDD.csv</li>
              <li>Example: 20240701.csv</li>
            </ul>
          </li>
          <li>
            <strong>Required Columns:</strong>
            <ul>
              <li>Aging WIP CSV: Key, Summary, 'Story Points', 'Issue Type', Status, 'In Progress'</li>
              <li>Cycle Time CSV: Key, Summary, 'Story Points', 'Issue Type', Status, 'In Progress', Closed</li>
            </ul>
          </li>
          <li>
            <strong>Date Formats:</strong>
            <ul>
              <li>Use DD/MM/YYYY for dates in the 'In Progress' and 'Closed' columns.</li>
            </ul>
          </li>
          <li>
            <strong>Additional Columns:</strong>
            <ul>
              <li>Extra columns beyond the required ones are allowed and will be ignored by the application.</li>
            </ul>
          </li>
          <li>
            <strong>File Size:</strong>
            <ul>
              <li>While there's no strict limit, very large files (e.g., over 10MB) may impact performance.</li>
            </ul>
          </li>
          <li>
            <strong>Data Types:</strong>
            <ul>
              <li>'Story Points' can be numbers or left blank.</li>
              <li>'Key', 'Summary', 'Issue Type', and 'Status' should be text.</li>
            </ul>
          </li>
          <li>
            <strong>Distinguishing File Types:</strong>
            <ul>
              <li>The app automatically detects whether it's Aging WIP or Cycle Time data based on the presence of a 'Closed' column.</li>
            </ul>
          </li>
        </ol>
        <p><strong>Note:</strong> The application uses the date in the filename to display "Data as of [date]" on the charts. Ensure the filename date accurately reflects your data's date for correct chart labeling.</p>
      </div>
    ),
  },
];

export const HelpComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 50,
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ?
      </button>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100
        }}>
          <div
            ref={modalRef}
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '80%',
              maxHeight: '80%',
              overflow: 'auto'
            }}
          >
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
            <div style={{ display: 'flex', marginBottom: '1rem' }}>
              {helpContents.map((content, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: activeTab === index ? '#007bff' : '#f0f0f0',
                    color: activeTab === index ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    marginRight: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {content.title}
                </button>
              ))}
            </div>
            <div>
              {helpContents[activeTab].content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};