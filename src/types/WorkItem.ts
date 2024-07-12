export interface WorkItem {
  Key: string;
  Summary: string;
  'Story Points'?: string;
  'Issue Type': string;
  Status: string;
  inProgress: Date;
}