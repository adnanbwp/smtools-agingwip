export interface WorkItem {
  key: string;
  summary: string;
  storyPoints?: number;
  status: string;
  inProgress: Date;
  issueType: 'Story' | 'Bug' | 'Task';
}