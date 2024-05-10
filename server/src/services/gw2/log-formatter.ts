import { Service } from 'typedi';
import { FormattedLogEntry, GW2LogEntry } from '../../dtos';

@Service()
export class GW2LogFormatter {
  formatLogEntries(entries: GW2LogEntry[]): FormattedLogEntry[] {
    const filtered = entries.filter(o =>
      ['joined', 'invited', 'kick', 'rank_change'].includes(o.type)
    );
    const formattedLogs = filtered.map(entry => this.formatLogEntry(entry));
    return formattedLogs;
  }

  formatLogEntry(entry: GW2LogEntry): FormattedLogEntry {
    const type = entry.type;

    const date = entry.time.split('T')[0]?.replace(/-/g, '/') ?? '-';
    const time = entry.time.split('T')[1]?.split('.')[0] ?? '-';
    let message = '';

    switch (type) {
      case 'joined':
        message = `${entry.user} joined the guild.`;
        break;
      case 'invited':
        message = `${entry.user} invited by ${entry.invited_by}`;
        break;
      case 'kick':
        if (entry.user == entry.kicked_by) {
          message = `${entry.user} left the guild.`;
        } else {
          message = `${entry.user} kicked by ${entry.kicked_by}`;
        }
        break;
      case 'rank_change':
        message = `${entry.changed_by} changed ${entry.user}'s rank from ${entry.old_rank} to ${entry.new_rank}`;
        break;
    }

    return { date, time, message };
  }
}
