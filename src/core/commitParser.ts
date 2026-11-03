/**
 * Git Commit Log Stream & Text Parser for GitStandup
 */

import { GitCommit, CommitCategory } from './types';

// Regex for Conventional Commit prefix: feat(scope): or fix: etc.
const CONVENTIONAL_PREFIX_REGEX = /^(feat|feature|fix|refactor|docs|test|chore|perf|ci)(?:\([^)]+\))?:\s*/i;

// Regex for Issue / Ticket references: PROJ-1234, ENG-421, #123
const TICKET_REGEX = /(?:\[|\()?(?:([A-Z]{2,10}-\d+)|#(\d+))(?:\]|\))?/g;

// Regex for Repository prefix: [frontend] or repo:backend
const REPO_PREFIX_REGEX = /^(?:\[([a-zA-Z0-9_-]+)\]|repo:([a-zA-Z0-9_-]+))\s*/i;

/**
 * Categorize commit message into standard categories
 */
export function extractCategory(message: string): CommitCategory {
  const match = message.match(CONVENTIONAL_PREFIX_REGEX);
  if (!match) {
    const lower = message.toLowerCase();
    if (lower.startsWith('fix') || lower.includes('bug')) return 'fix';
    if (lower.startsWith('add') || lower.startsWith('implement') || lower.startsWith('support')) return 'feat';
    if (lower.startsWith('refactor') || lower.startsWith('clean')) return 'refactor';
    if (lower.startsWith('doc') || lower.startsWith('readme')) return 'docs';
    if (lower.startsWith('test')) return 'test';
    if (lower.startsWith('perf') || lower.startsWith('optimize')) return 'perf';
    if (lower.startsWith('ci') || lower.startsWith('pipeline') || lower.startsWith('build')) return 'ci';
    return 'other';
  }

  const prefix = match[1].toLowerCase();
  switch (prefix) {
    case 'feature':
    case 'feat':
      return 'feat';
    case 'fix':
      return 'fix';
    case 'refactor':
      return 'refactor';
    case 'docs':
      return 'docs';
    case 'test':
      return 'test';
    case 'chore':
      return 'chore';
    case 'perf':
      return 'perf';
    case 'ci':
      return 'ci';
    default:
      return 'other';
  }
}

/**
 * Extract ticket ID (e.g. "ENG-421" or "#123")
 */
export function extractTicketId(message: string): string | undefined {
  TICKET_REGEX.lastIndex = 0;
  const match = TICKET_REGEX.exec(message);
  if (match) {
    return match[1] || (match[2] ? `#${match[2]}` : undefined);
  }
  return undefined;
}

/**
 * Clean a commit message to human-readable sentence case
 */
export function cleanCommitMessage(raw: string): string {
  let cleaned = raw.trim();

  // Strip repo prefix if present
  cleaned = cleaned.replace(REPO_PREFIX_REGEX, '');

  // Strip conventional prefix
  cleaned = cleaned.replace(CONVENTIONAL_PREFIX_REGEX, '');

  // Strip trailing ticket bracket like [ENG-123] or (#123)
  cleaned = cleaned.replace(/\s*(?:\[|\()?(?:[A-Z]{2,10}-\d+|#\d+)(?:\]|\))?\s*$/g, '');

  // Strip trailing periods
  cleaned = cleaned.replace(/\.+$/, '').trim();

  if (!cleaned) return raw;

  // Capitalize first character
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Parses raw git log output (multiline, oneline, or pipe-separated)
 */
export function parseGitLog(rawText: string, defaultRepo: string = 'main-repo'): GitCommit[] {
  if (!rawText.trim()) return [];

  const lines = rawText.split('\n');
  const commits: GitCommit[] = [];

  // Check if it's full multiline "commit <sha>\nAuthor: ...\nDate: ...\n\nmessage"
  if (rawText.includes('commit ') && (rawText.includes('Author:') || rawText.includes('Date:'))) {
    return parseFullGitLog(rawText, defaultRepo);
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Check pipe-separated format: hash|author|date|message
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        const hash = parts[0];
        let author = 'Unknown';
        let dateStr = new Date().toISOString();
        let message = '';
        let repo = defaultRepo;

        if (parts.length >= 4) {
          author = parts[1] || 'Unknown';
          dateStr = parts[2] || new Date().toISOString();
          message = parts.slice(3).join('|');
        } else if (parts.length === 3) {
          dateStr = parts[1] || new Date().toISOString();
          message = parts[2];
        } else {
          message = parts[1];
        }

        const repoMatch = message.match(REPO_PREFIX_REGEX);
        if (repoMatch) {
          repo = repoMatch[1] || repoMatch[2] || defaultRepo;
        }

        const msgWithoutRepo = message.replace(REPO_PREFIX_REGEX, '').trim();
        const dateObj = new Date(dateStr);
        const timestamp = isNaN(dateObj.getTime()) ? Date.now() : dateObj.getTime();

        commits.push({
          hash: hash.slice(0, 7),
          fullHash: hash,
          author,
          date: new Date(timestamp).toISOString(),
          timestamp,
          rawMessage: message,
          cleanedMessage: cleanCommitMessage(message),
          category: extractCategory(msgWithoutRepo),
          ticketId: extractTicketId(message),
          repo,
        });
        continue;
      }
    }

    // Standard oneline format: "a1b2c3d [repo] feat: some message"
    const onelineMatch = line.match(/^([a-f0-9]{7,40})\s+(.+)$/i);
    if (onelineMatch) {
      const hash = onelineMatch[1];
      let message = onelineMatch[2].trim();
      let repo = defaultRepo;

      const repoMatch = message.match(REPO_PREFIX_REGEX);
      if (repoMatch) {
        repo = repoMatch[1] || repoMatch[2] || defaultRepo;
      }

      const msgWithoutRepo = message.replace(REPO_PREFIX_REGEX, '').trim();

      commits.push({
        hash: hash.slice(0, 7),
        fullHash: hash,
        author: 'Me',
        date: new Date().toISOString(),
        timestamp: Date.now(),
        rawMessage: message,
        cleanedMessage: cleanCommitMessage(message),
        category: extractCategory(msgWithoutRepo),
        ticketId: extractTicketId(message),
        repo,
      });
      continue;
    }

    // Fallback: bullet point or unformatted commit line without hash
    if (line.length > 3) {
      let message = line.replace(/^[-*•]\s*/, '').trim();
      let repo = defaultRepo;

      const repoMatch = message.match(REPO_PREFIX_REGEX);
      if (repoMatch) {
        repo = repoMatch[1] || repoMatch[2] || defaultRepo;
      }

      const msgWithoutRepo = message.replace(REPO_PREFIX_REGEX, '').trim();
      const pseudoHash = Math.random().toString(16).substring(2, 9);
      commits.push({
        hash: pseudoHash,
        author: 'Me',
        date: new Date().toISOString(),
        timestamp: Date.now(),
        rawMessage: message,
        cleanedMessage: cleanCommitMessage(message),
        category: extractCategory(msgWithoutRepo),
        ticketId: extractTicketId(message),
        repo,
      });
    }
  }

  return commits;
}

/**
 * Parse standard verbose multiline Git log
 */
function parseFullGitLog(rawText: string, defaultRepo: string): GitCommit[] {
  const commits: GitCommit[] = [];
  const blocks = rawText.split(/^commit\s+([a-f0-9]{7,40})/m);

  for (let i = 1; i < blocks.length; i += 2) {
    const fullHash = blocks[i].trim();
    const blockBody = blocks[i + 1] || '';

    let author = 'Me';
    let dateStr = '';
    const messageLines: string[] = [];

    const lines = blockBody.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('Author:')) {
        author = trimmed.replace('Author:', '').trim();
      } else if (trimmed.startsWith('Date:')) {
        dateStr = trimmed.replace('Date:', '').trim();
      } else if (line.startsWith('    ')) {
        messageLines.push(trimmed);
      }
    }

    const message = messageLines.filter(Boolean).join(' ').trim();
    if (!message) continue;

    let repo = defaultRepo;
    const repoMatch = message.match(REPO_PREFIX_REGEX);
    if (repoMatch) {
      repo = repoMatch[1] || repoMatch[2] || defaultRepo;
    }

    const dateObj = dateStr ? new Date(dateStr) : new Date();
    const timestamp = isNaN(dateObj.getTime()) ? Date.now() : dateObj.getTime();

    commits.push({
      hash: fullHash.slice(0, 7),
      fullHash,
      author,
      date: new Date(timestamp).toISOString(),
      timestamp,
      rawMessage: message,
      cleanedMessage: cleanCommitMessage(message),
      category: extractCategory(message),
      ticketId: extractTicketId(message),
      repo,
    });
  }

  return commits;
}
