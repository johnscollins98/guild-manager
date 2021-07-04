export default interface GW2LogEntry {
  type: string;
  time: string;
  user?: string;
  invited_by?: string;
  kicked_by?: string;
  changed_by?: string;
  old_rank?: string;
  new_rank?: string;
}