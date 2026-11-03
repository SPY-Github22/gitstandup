/**
 * Multi-Platform Formatter Engine for GitStandup
 * Formats structured standup data for Slack, Markdown, Jira, and Plain Text
 */

import { StandupData, StandupItem, StandupBlocker, StandupGeneratorOptions, StandupFormat } from './types';

const DEFAULT_OPTIONS: StandupGeneratorOptions = {
  includeTicketIds: true,
  includeRepoTags: true,
  groupByRepo: false,
  includeEmoji: true,
};

function formatItemLine(
  item: StandupItem,
  format: StandupFormat,
  options: StandupGeneratorOptions
): string {
  const parts: string[] = [];

  if (options.includeRepoTags && item.repo && item.repo !== 'main-repo') {
    if (format === 'slack') {
      parts.push(`*[${item.repo}]*`);
    } else if (format === 'markdown') {
      parts.push(`**[${item.repo}]**`);
    } else if (format === 'jira') {
      parts.push(`(${item.repo})`);
    } else {
      parts.push(`[${item.repo}]`);
    }
  }

  parts.push(item.text);

  if (options.includeTicketIds && item.ticketId) {
    if (format === 'slack') {
      parts.push(`(\`${item.ticketId}\`)`);
    } else if (format === 'markdown') {
      parts.push(`(\`${item.ticketId}\`)`);
    } else if (format === 'jira') {
      parts.unshift(`[${item.ticketId}]`);
    } else {
      parts.push(`(${item.ticketId})`);
    }
  }

  const bullet = format === 'slack' ? '•' : '-';
  return `${bullet} ${parts.join(' ')}`;
}

function formatBlockerLine(
  blocker: StandupBlocker,
  format: StandupFormat,
  includeEmoji: boolean
): string {
  const emoji = includeEmoji ? '⚠️ ' : '';
  const bullet = format === 'slack' ? '•' : '-';
  const ticket = blocker.ticketId ? ` (${blocker.ticketId})` : '';
  return `${bullet} ${emoji}${blocker.text}${ticket}`;
}

/**
 * Format standup for Slack & Discord
 */
export function formatSlackStandup(
  data: StandupData,
  opts: StandupGeneratorOptions = {}
): string {
  const options = { ...DEFAULT_OPTIONS, ...opts };
  const lines: string[] = [];

  // Done section
  lines.push(options.includeEmoji ? '*Yesterday / Done:*' : '*Yesterday / Done:*');
  if (data.done.length === 0) {
    lines.push('• _No completed commits in this window_');
  } else {
    for (const item of data.done) {
      lines.push(formatItemLine(item, 'slack', options));
    }
  }

  lines.push('');

  // In Progress section
  lines.push(options.includeEmoji ? '*Today / In Progress:*' : '*Today / In Progress:*');
  if (data.inProgress.length === 0) {
    lines.push('• _Continuing previous targets_');
  } else {
    for (const item of data.inProgress) {
      lines.push(formatItemLine(item, 'slack', options));
    }
  }

  lines.push('');

  // Blockers section
  lines.push(options.includeEmoji ? '*Blockers:*' : '*Blockers:*');
  const activeBlockers = data.blockers.filter(b => !b.resolved);
  if (activeBlockers.length === 0) {
    lines.push('• _None_');
  } else {
    for (const b of activeBlockers) {
      lines.push(formatBlockerLine(b, 'slack', Boolean(options.includeEmoji)));
    }
  }

  return lines.join('\n');
}

/**
 * Format standup for Markdown (GitHub / Notion / Docs)
 */
export function formatMarkdownStandup(
  data: StandupData,
  opts: StandupGeneratorOptions = {}
): string {
  const options = { ...DEFAULT_OPTIONS, ...opts };
  const lines: string[] = [];

  lines.push(options.includeEmoji ? '### 🚀 Yesterday / Done' : '### Yesterday / Done');
  if (data.done.length === 0) {
    lines.push('- *No completed commits in this window*');
  } else {
    for (const item of data.done) {
      lines.push(formatItemLine(item, 'markdown', options));
    }
  }

  lines.push('');

  lines.push(options.includeEmoji ? '### ⏳ Today / In Progress' : '### Today / In Progress');
  if (data.inProgress.length === 0) {
    lines.push('- *Continuing previous targets*');
  } else {
    for (const item of data.inProgress) {
      lines.push(formatItemLine(item, 'markdown', options));
    }
  }

  lines.push('');

  lines.push(options.includeEmoji ? '### 🛑 Blockers' : '### Blockers');
  const activeBlockers = data.blockers.filter(b => !b.resolved);
  if (activeBlockers.length === 0) {
    lines.push('- *None*');
  } else {
    for (const b of activeBlockers) {
      lines.push(formatBlockerLine(b, 'markdown', Boolean(options.includeEmoji)));
    }
  }

  return lines.join('\n');
}

/**
 * Format standup for Jira / Confluence
 */
export function formatJiraStandup(
  data: StandupData,
  opts: StandupGeneratorOptions = {}
): string {
  const options = { ...DEFAULT_OPTIONS, ...opts };
  const lines: string[] = [];

  lines.push('h3. Yesterday / Done');
  if (data.done.length === 0) {
    lines.push('* _No completed commits in this window_');
  } else {
    for (const item of data.done) {
      const line = formatItemLine(item, 'jira', options).replace(/^- /, '* ');
      lines.push(line);
    }
  }

  lines.push('');

  lines.push('h3. Today / In Progress');
  if (data.inProgress.length === 0) {
    lines.push('* _Continuing previous targets_');
  } else {
    for (const item of data.inProgress) {
      const line = formatItemLine(item, 'jira', options).replace(/^- /, '* ');
      lines.push(line);
    }
  }

  lines.push('');

  lines.push('h3. Blockers');
  const activeBlockers = data.blockers.filter(b => !b.resolved);
  if (activeBlockers.length === 0) {
    lines.push('* _None_');
  } else {
    for (const b of activeBlockers) {
      lines.push(`* ${b.text}${b.ticketId ? ` (${b.ticketId})` : ''}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format standup for plain text / email
 */
export function formatPlainStandup(
  data: StandupData,
  opts: StandupGeneratorOptions = {}
): string {
  const options = { ...DEFAULT_OPTIONS, ...opts };
  const lines: string[] = [];

  lines.push('YESTERDAY / DONE:');
  if (data.done.length === 0) {
    lines.push('- (No completed commits in this window)');
  } else {
    for (const item of data.done) {
      lines.push(formatItemLine(item, 'plain', options));
    }
  }

  lines.push('');

  lines.push('TODAY / IN PROGRESS:');
  if (data.inProgress.length === 0) {
    lines.push('- (Continuing previous targets)');
  } else {
    for (const item of data.inProgress) {
      lines.push(formatItemLine(item, 'plain', options));
    }
  }

  lines.push('');

  lines.push('BLOCKERS:');
  const activeBlockers = data.blockers.filter(b => !b.resolved);
  if (activeBlockers.length === 0) {
    lines.push('- None');
  } else {
    for (const b of activeBlockers) {
      lines.push(`- ${b.text}${b.ticketId ? ` (${b.ticketId})` : ''}`);
    }
  }

  return lines.join('\n');
}

/**
 * Dispatcher to format into requested format
 */
export function formatStandup(
  data: StandupData,
  format: StandupFormat,
  options?: StandupGeneratorOptions
): string {
  switch (format) {
    case 'slack':
      return formatSlackStandup(data, options);
    case 'markdown':
      return formatMarkdownStandup(data, options);
    case 'jira':
      return formatJiraStandup(data, options);
    case 'plain':
      return formatPlainStandup(data, options);
  }
}
