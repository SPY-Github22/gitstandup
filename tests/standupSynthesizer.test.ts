import { describe, it, expect } from 'vitest';
import { groupCommits, filterCommitsByTimeframe, synthesizeStandup } from '../src/core/standupSynthesizer';
import { GitCommit } from '../src/core/types';

describe('Standup Synthesizer Engine', () => {
  const refDate = new Date('2026-11-03T12:00:00Z');
  const nowTs = refDate.getTime();
  const yesterdayTs = nowTs - 20 * 60 * 60 * 1000; // 20 hours ago
  const threeDaysAgoTs = nowTs - 72 * 60 * 60 * 1000;

  const mockCommits: GitCommit[] = [
    {
      hash: 'a1b2c3d',
      author: 'Dev',
      date: new Date(nowTs).toISOString(),
      timestamp: nowTs,
      rawMessage: 'feat(auth): add OAuth2 provider [ENG-200]',
      cleanedMessage: 'Add OAuth2 provider',
      category: 'feat',
      ticketId: 'ENG-200',
      repo: 'auth-service',
    },
    {
      hash: 'b2c3d4e',
      author: 'Dev',
      date: new Date(nowTs).toISOString(),
      timestamp: nowTs,
      rawMessage: 'test(auth): add unit tests for OAuth2 [ENG-200]',
      cleanedMessage: 'Add unit tests for OAuth2',
      category: 'test',
      ticketId: 'ENG-200',
      repo: 'auth-service',
    },
    {
      hash: 'c3d4e5f',
      author: 'Dev',
      date: new Date(yesterdayTs).toISOString(),
      timestamp: yesterdayTs,
      rawMessage: 'fix(db): resolve connection pool starvation',
      cleanedMessage: 'Resolve connection pool starvation',
      category: 'fix',
      repo: 'core-backend',
    },
    {
      hash: 'd4e5f6a',
      author: 'Dev',
      date: new Date(threeDaysAgoTs).toISOString(),
      timestamp: threeDaysAgoTs,
      rawMessage: 'wip: failing test blocked by upstream schema migration',
      cleanedMessage: 'Wip: failing test blocked by upstream schema migration',
      category: 'other',
      repo: 'core-backend',
    },
  ];

  it('should group multiple commits sharing the same ticket ID', () => {
    const grouped = groupCommits(mockCommits);
    const eng200 = grouped.find(g => g.ticketId === 'ENG-200');

    expect(eng200).toBeDefined();
    expect(eng200?.commits).toHaveLength(2);
    expect(eng200?.repo).toBe('auth-service');
  });

  it('should filter commits accurately by timeframe relative to reference date', () => {
    const todayOnly = filterCommitsByTimeframe(mockCommits, 'today', refDate);
    expect(todayOnly).toHaveLength(2);

    const yesterdayOnly = filterCommitsByTimeframe(mockCommits, 'yesterday', refDate);
    expect(yesterdayOnly).toHaveLength(1);
    expect(yesterdayOnly[0].hash).toBe('c3d4e5f');

    const last7 = filterCommitsByTimeframe(mockCommits, 'last7days', refDate);
    expect(last7).toHaveLength(4);
  });

  it('should synthesize Done, In Progress, and auto-detect Blockers', () => {
    const standup = synthesizeStandup(
      mockCommits,
      [{ id: 'b1', text: 'Waiting for staging API keys', resolved: false }],
      'all',
      { referenceDate: refDate }
    );

    expect(standup.inProgress).toHaveLength(1); // The grouped ENG-200
    expect(standup.done).toHaveLength(2); // Connection pool + schema migration
    expect(standup.blockers).toHaveLength(2); // Manual blocker + auto-detected blocker
    expect(standup.blockers.some(b => b.text.includes('blocked by'))).toBe(true);
  });
});
