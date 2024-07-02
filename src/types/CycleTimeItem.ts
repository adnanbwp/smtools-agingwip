export interface CycleTimeItem {
  key: string;
  summary: string;
  storyPoints?: number;
  issueType: string;
  status: string;
  inProgress: Date;
  closed: Date;
  cycleTime: number;
}