import { describe, it, expect } from 'vitest';
import { extractCategory, extractTicketId, cleanCommitMessage, parseGitLog } from '../src/core/commitParser';

describe('Commit Parser Engine', () => {
  it('should categorize conventional commits and fallback heuristics', () => {
    expect(extractCategory('feat(auth): support OAuth2 PKCE flow')).toBe('feat');
    expect(extractCategory('fix: resolve memory leak in worker pool')).toBe('fix');
    expect(extractCategory('refactor(api): clean up request middleware')).toBe('refactor');
    expect(extractCategory('docs: update deployment architecture diagram')).toBe('docs');
    expect(extractCategory('test: add integration test suite')).toBe('test');
    expect(extractCategory('chore: upgrade dependencies')).toBe('chore');
    expect(extractCategory('perf: optimize query indexing')).toBe('perf');
    expect(extractCategory('ci: configure GitHub Pages release')).toBe('ci');
    expect(extractCategory('Add new payment button')).toBe('feat');
    expect(extractCategory('Bugfix for user profile avatar')).toBe('fix');
  });

  it('should extract Jira / Linear / GitHub ticket references', () => {
    expect(extractTicketId('feat(auth): login flow [ENG-402]')).toBe('ENG-402');
    expect(extractTicketId('fix: crash on boot (PROJ-99)')).toBe('PROJ-99');
    expect(extractTicketId('fix: button alignment (#456)')).toBe('#456');
    expect(extractTicketId('chore: clean up dependencies')).toBeUndefined();
  });

  it('should clean commit messages into professional human-readable sentence case', () => {
    expect(cleanCommitMessage('feat(auth): support OAuth2 PKCE flow [ENG-402]')).toBe('Support OAuth2 PKCE flow');
    expect(cleanCommitMessage('fix: resolve race condition in mutex.')).toBe('Resolve race condition in mutex');
    expect(cleanCommitMessage('[frontend] feat: new dashboard modal')).toBe('New dashboard modal');
  });

  it('should parse oneline git log with repo tags', () => {
    const raw = `
      a1b2c3d [backend] feat(db): implement redis caching layer [ENG-101]
      e5f6789 [frontend] fix: responsive banner layout on mobile
      9876543 chore: bump vite from 6.0 to 6.2
    `;

    const commits = parseGitLog(raw, 'default-app');
    expect(commits).toHaveLength(3);

    expect(commits[0].hash).toBe('a1b2c3d');
    expect(commits[0].repo).toBe('backend');
    expect(commits[0].category).toBe('feat');
    expect(commits[0].ticketId).toBe('ENG-101');
    expect(commits[0].cleanedMessage).toBe('Implement redis caching layer');

    expect(commits[1].hash).toBe('e5f6789');
    expect(commits[1].repo).toBe('frontend');
    expect(commits[1].category).toBe('fix');
    expect(commits[1].cleanedMessage).toBe('Responsive banner layout on mobile');

    expect(commits[2].hash).toBe('9876543');
    expect(commits[2].repo).toBe('default-app');
  });

  it('should parse full multiline git log format', () => {
    const verboseLog = `
commit a1b2c3d4e5f67890123456789012345678901234
Author: Alex Chen <alex@company.org>
Date:   Mon Nov 2 12:00:00 2026 +0000

    feat(search): implement fuzzy query ranking [SEARCH-88]

commit b2c3d4e5f6789012345678901234567890123456
Author: Alex Chen <alex@company.org>
Date:   Mon Nov 2 14:15:00 2026 +0000

    fix: prevent nil pointer exception when search results are empty
    `;

    const commits = parseGitLog(verboseLog, 'search-service');
    expect(commits).toHaveLength(2);
    expect(commits[0].author).toBe('Alex Chen <alex@company.org>');
    expect(commits[0].category).toBe('feat');
    expect(commits[0].ticketId).toBe('SEARCH-88');
    expect(commits[1].category).toBe('fix');
  });
});
