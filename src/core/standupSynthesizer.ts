/**
 * Standup Synthesizer Engine for GitStandup
 * Groups, categorizes, and maps Git commits into:
 * - Yesterday / Done
 * - Today / In Progress
 * - Blockers
 */

import { GitCommit, StandupData, StandupItem, StandupBlocker, TimeframeFilter } from './types';

export interface SynthesizerOptions {
  referenceDate?: Date; // Custom reference point for unit testing or historical standups
  deduplicateByTicket?: boolean;
}

/**
 * Groups commits by ticket or description to avoid redundant bullets
 */
export function groupCommits(commits: GitCommit[]): StandupItem[] {
  const groups = new Map<string, GitCommit[]>();

  for (const commit of commits) {
    // Group key: ticketId if present, otherwise normalized cleaned message
    const key = commit.ticketId ? `ticket:${commit.ticketId}` : `msg:${commit.repo}:${commit.cleanedMessage.toLowerCase()}`;
    const existing = groups.get(key) || [];
    existing.push(commit);
    groups.set(key, existing);
  }

  const items: StandupItem[] = [];

  for (const [key, group] of groups.entries()) {
    // Pick the most representative commit (latest timestamp)
    group.sort((a, b) => b.timestamp - a.timestamp);
    const primary = group[0];

    // If grouped by ticket with multiple commits, synthesize a cohesive description
    let summaryText = primary.cleanedMessage;
    if (group.length > 1 && primary.ticketId) {
      const distinctMessages = Array.from(new Set(group.map(c => c.cleanedMessage)));
      if (distinctMessages.length > 1) {
        summaryText = `${distinctMessages[0]} (+${distinctMessages.length - 1} related updates)`;
      }
    }

    items.push({
      id: `item_${primary.hash}_${key}`,
      text: summaryText,
      category: primary.category,
      ticketId: primary.ticketId,
      commits: group,
      repo: primary.repo,
    });
  }

  return items;
}

/**
 * Filter commits by selected timeframe
 */
export function filterCommitsByTimeframe(
  commits: GitCommit[],
  timeframe: TimeframeFilter,
  referenceDate: Date = new Date()
): GitCommit[] {
  if (timeframe === 'all') return [...commits];

  const ref = new Date(referenceDate);
  const startOfToday = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOfLast7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;

  switch (timeframe) {
    case 'today':
      return commits.filter(c => c.timestamp >= startOfToday);
    case 'yesterday':
      return commits.filter(c => c.timestamp >= startOfYesterday && c.timestamp < startOfToday);
    case 'last7days':
      return commits.filter(c => c.timestamp >= startOfLast7Days);
    default:
      return [...commits];
  }
}

/**
 * Synthesizes Standup sections from parsed Git commits
 */
export function synthesizeStandup(
  commits: GitCommit[],
  existingBlockers: StandupBlocker[] = [],
  timeframe: TimeframeFilter = 'all',
  options: SynthesizerOptions = {}
): StandupData {
  const ref = options.referenceDate ? new Date(options.referenceDate) : new Date();
  const startOfToday = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate()).getTime();

  // Partition into Done (past) vs In Progress (current day / active)
  const doneCommits: GitCommit[] = [];
  const inProgressCommits: GitCommit[] = [];
  const autoBlockers: StandupBlocker[] = [];

  const filteredCommits = filterCommitsByTimeframe(commits, timeframe, ref);

  for (const commit of filteredCommits) {
    // Check if commit message flags a blocker or WIP issue
    const lower = commit.rawMessage.toLowerCase();
    if (lower.includes('blocked by') || lower.includes('[blocker]') || lower.includes('wip: failing')) {
      autoBlockers.push({
        id: `blocker_${commit.hash}`,
        text: `${commit.cleanedMessage} (${commit.repo})`,
        resolved: false,
        ticketId: commit.ticketId,
      });
    }

    if (commit.timestamp >= startOfToday) {
      // Made today -> In progress
      inProgressCommits.push(commit);
    } else {
      // Made before today -> Done / Completed
      doneCommits.push(commit);
    }
  }

  // Combine manual and auto-detected blockers (avoid duplicates)
  const allBlockers = [...existingBlockers];
  for (const ab of autoBlockers) {
    if (!allBlockers.some(b => b.text === ab.text)) {
      allBlockers.push(ab);
    }
  }

  // If filtered strictly by "yesterday", move all to Done and leave In Progress for user's today targets
  if (timeframe === 'yesterday') {
    return {
      done: groupCommits(filteredCommits),
      inProgress: [],
      blockers: allBlockers,
    };
  }

  // If filtered strictly by "today", move all to In Progress
  if (timeframe === 'today') {
    return {
      done: [],
      inProgress: groupCommits(filteredCommits),
      blockers: allBlockers,
    };
  }

  return {
    done: groupCommits(doneCommits),
    inProgress: groupCommits(inProgressCommits),
    blockers: allBlockers,
  };
}
