import { Service } from 'typedi';
import { GW2LogEntry, GW2LogEntryDTO } from '../../dtos';

@Service()
export class GW2LogFormatter {
  formatLogEntries(entries: GW2LogEntry[]): GW2LogEntryDTO[] {
    const filtered = entries.filter(o =>
      ['joined', 'invited', 'kick', 'rank_change'].includes(o.type)
    );
    const formattedLogs = filtered.map(entry => this.formatLogEntry(entry));
    return formattedLogs;
  }

  formatLogEntry(entry: GW2LogEntry): GW2LogEntryDTO {
    const type = entry.type;

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

    return { date: entry.time, message };
  }
}
