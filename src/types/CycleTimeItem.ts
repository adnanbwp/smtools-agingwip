export interface CycleTimeItem {
  Key: string;
  Summary: string;
  'Story Points'?: string;
  'Issue Type': string;
  Status: string;
  inProgress: Date;
  closed: Date;
  cycleTime?: number;
  calculatedCycleTime?: number;
}