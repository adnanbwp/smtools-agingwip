import { WorkItem } from './types/WorkItem';
import { CycleTimeItem } from './types/CycleTimeItem';

export const sampleAgingWipData: WorkItem[] = [
  {
    Key: "Story1",
    Summary: "Summary 1",
    "Story Points": "3",
    "Issue Type": "Story",
    Status: "In Progress",
    inProgress: new Date(2024, 6, 1) // July 1, 2024
  },
  {
    Key: "Bug1",
    Summary: "Summary 2",
    "Story Points": "5",
    "Issue Type": "Bug",
    Status: "In Progress",
    inProgress: new Date(2024, 5, 24) // June 24, 2024
  },
  {
    Key: "Story2",
    Summary: "Summary 3",
    "Story Points": "5",
    "Issue Type": "Story",
    Status: "In Progress",
    inProgress: new Date(2024, 5, 26) // June 26, 2024
  },
  {
    Key: "Bug2",
    Summary: "Summary 4",
    "Story Points": "3",
    "Issue Type": "Bug",
    Status: "In Progress",
    inProgress: new Date(2024, 5, 27) // June 27, 2024
  },
  {
    Key: "Bug3",
    Summary: "Summary 5",
    "Story Points": "5",
    "Issue Type": "Bug",
    Status: "In Review",
    inProgress: new Date(2024, 5, 19) // June 19, 2024
  },
  {
    Key: "Story3",
    Summary: "Summary 6",
    "Story Points": "3",
    "Issue Type": "Story",
    Status: "In Test",
    inProgress: new Date(2024, 5, 17) // June 17, 2024
  },
  {
    Key: "Bug4",
    Summary: "Summary 7",
    "Story Points": "5",
    "Issue Type": "Bug",
    Status: "In Test",
    inProgress: new Date(2024, 5, 13) // June 13, 2024
  },
  {
    Key: "Story4",
    Summary: "Summary 8",
    "Story Points": "5",
    "Issue Type": "Story",
    Status: "In Review",
    inProgress: new Date(2024, 5, 5) // June 5, 2024
  },
  {
    Key: "Story5",
    Summary: "Summary 9",
    "Story Points": "5",
    "Issue Type": "Story",
    Status: "In Progress",
    inProgress: new Date(2024, 5, 7) // June 7, 2024
  },
  {
    Key: "Story6",
    Summary: "Summary 10",
    "Story Points": "8",
    "Issue Type": "Story",
    Status: "In Test",
    inProgress: new Date(2024, 4, 16) // May 16, 2024
  }
];

export const sampleCycleTimeData: CycleTimeItem[] = [
  {
    Key: "Story7",
    Summary: "Summary 11",
    "Story Points": "5",
    "Issue Type": "Story",
    Status: "Closed",
    inProgress: new Date(2024, 4, 13), // May 13, 2024
    closed: new Date(2024, 5, 4), // June 4, 2024
    cycleTime: 22
  },
  {
    Key: "Bug5",
    Summary: "Summary 12",
    "Story Points": "5",
    "Issue Type": "Bug",
    Status: "Closed",
    inProgress: new Date(2024, 4, 28), // May 28, 2024
    closed: new Date(2024, 5, 5), // June 5, 2024
    cycleTime: 8
  },
  {
    Key: "Story8",
    Summary: "Summary 13",
    "Story Points": "3",
    "Issue Type": "Story",
    Status: "Closed",
    inProgress: new Date(2024, 4, 26), // May 26, 2024
    closed: new Date(2024, 5, 4), // June 4, 2024
    cycleTime: 9
  },
  {
    Key: "Story9",
    Summary: "Summary 14",
    "Story Points": "3",
    "Issue Type": "Story",
    Status: "Closed",
    inProgress: new Date(2024, 4, 21), // May 21, 2024
    closed: new Date(2024, 5, 5), // June 5, 2024
    cycleTime: 15
  },
  {
    Key: "Bug6",
    Summary: "Summary 15",
    "Story Points": "5",
    "Issue Type": "Bug",
    Status: "Closed",
    inProgress: new Date(2024, 4, 28), // May 28, 2024
    closed: new Date(2024, 5, 5), // June 5, 2024
    cycleTime: 8
  },
  {
    Key: "Story10",
    Summary: "Summary 16",
    "Story Points": "3",
    "Issue Type": "Story",
    Status: "Closed",
    inProgress: new Date(2024, 5, 3), // June 3, 2024
    closed: new Date(2024, 5, 6), // June 6, 2024
    cycleTime: 3
  },
  {
    Key: "Story11",
    Summary: "Summary 17",
    "Story Points": "3",
    "Issue Type": "Story",
    Status: "Closed",
    inProgress: new Date(2024, 5, 5), // June 5, 2024
    closed: new Date(2024, 5, 6), // June 6, 2024
    cycleTime: 1
  },
  {
    Key: "Story12",
    Summary: "Summary 18",
    "Story Points": "5",
    "Issue Type": "Story",
    Status: "Closed",
    inProgress: new Date(2024, 5, 6), // June 6, 2024
    closed: new Date(2024, 5, 6), // June 6, 2024
    cycleTime: 0
  },
  {
    Key: "Story13",
    Summary: "Summary 19",
    "Story Points": "3",
    "Issue Type": "Story",
    Status: "Closed",
    inProgress: new Date(2024, 5, 10), // June 10, 2024
    closed: new Date(2024, 5, 11), // June 11, 2024
    cycleTime: 1
  },
  {
    Key: "Story14",
    Summary: "Summary 20",
    "Story Points": "8",
    "Issue Type": "Story",
    Status: "Closed",
    inProgress: new Date(2024, 3, 24), // April 24, 2024
    closed: new Date(2024, 5, 11), // June 11, 2024
    cycleTime: 48
  }
];