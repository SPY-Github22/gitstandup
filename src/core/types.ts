/**
 * Type Definitions for GitStandup
 */

export type CommitCategory =
  | 'feat'
  | 'fix'
  | 'refactor'
  | 'docs'
  | 'test'
  | 'chore'
  | 'perf'
  | 'ci'
  | 'other';

export interface GitCommit {
  hash: string;
  fullHash?: string;
  author: string;
  date: string;
  timestamp: number;
  rawMessage: string;
  cleanedMessage: string;
  category: CommitCategory;
  ticketId?: string;
  repo: string;
  branch?: string;
}

export type TimeframeFilter = 'today' | 'yesterday' | 'last7days' | 'all';

export interface StandupItem {
  id: string;
  text: string;
  category: CommitCategory;
  ticketId?: string;
  commits: GitCommit[];
  repo: string;
}

export interface StandupBlocker {
  id: string;
  text: string;
  resolved: boolean;
  ticketId?: string;
}

export interface StandupData {
  done: StandupItem[];
  inProgress: StandupItem[];
  blockers: StandupBlocker[];
}

export type StandupFormat = 'slack' | 'markdown' | 'jira' | 'plain';

export interface StandupGeneratorOptions {
  includeTicketIds?: boolean;
  includeRepoTags?: boolean;
  groupByRepo?: boolean;
  includeEmoji?: boolean;
}
