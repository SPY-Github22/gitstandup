import { describe, it, expect } from 'vitest';
import { formatSlackStandup, formatMarkdownStandup, formatJiraStandup, formatPlainStandup, formatStandup } from '../src/core/formatters';
import { StandupData } from '../src/core/types';

describe('Standup Multi-Format Exporters', () => {
  const mockData: StandupData = {
    done: [
      {
        id: '1',
        text: 'Add OAuth2 provider',
        category: 'feat',
        ticketId: 'ENG-200',
        commits: [],
        repo: 'auth-service',
      },
    ],
    inProgress: [
      {
        id: '2',
        text: 'Unit test suite for session refresh',
        category: 'test',
        commits: [],
        repo: 'auth-service',
      },
    ],
    blockers: [
      {
        id: 'b1',
        text: 'Awaiting staging database credentials',
        resolved: false,
      },
      {
        id: 'b2',
        text: 'Resolved old issue',
        resolved: true, // Should be ignored in standup output
      },
    ],
  };

  it('should format Slack standup with bold bullets and inline tickets', () => {
    const slack = formatSlackStandup(mockData);
    expect(slack).toContain('*Yesterday / Done:*');
    expect(slack).toContain('• *[auth-service]* Add OAuth2 provider (`ENG-200`)');
    expect(slack).toContain('*Today / In Progress:*');
    expect(slack).toContain('• *[auth-service]* Unit test suite for session refresh');
    expect(slack).toContain('*Blockers:*');
    expect(slack).toContain('⚠️ Awaiting staging database credentials');
    expect(slack).not.toContain('Resolved old issue');
  });

  it('should format Markdown standup with headers and badges', () => {
    const md = formatMarkdownStandup(mockData);
    expect(md).toContain('### 🚀 Yesterday / Done');
    expect(md).toContain('- **[auth-service]** Add OAuth2 provider (`ENG-200`)');
    expect(md).toContain('### ⏳ Today / In Progress');
    expect(md).toContain('### 🛑 Blockers');
    expect(md).toContain('- ⚠️ Awaiting staging database credentials');
  });

  it('should format Jira markup with h3 tags', () => {
    const jira = formatJiraStandup(mockData);
    expect(jira).toContain('h3. Yesterday / Done');
    expect(jira).toContain('* [ENG-200] (auth-service) Add OAuth2 provider');
    expect(jira).toContain('h3. Blockers');
  });

  it('should format Plain Text clean report', () => {
    const plain = formatPlainStandup(mockData);
    expect(plain).toContain('YESTERDAY / DONE:');
    expect(plain).toContain('- [auth-service] Add OAuth2 provider (ENG-200)');
    expect(plain).toContain('BLOCKERS:');
  });

  it('should dispatch through formatStandup correctly', () => {
    expect(formatStandup(mockData, 'slack')).toContain('*Yesterday / Done:*');
    expect(formatStandup(mockData, 'markdown')).toContain('### 🚀 Yesterday / Done');
    expect(formatStandup(mockData, 'jira')).toContain('h3. Yesterday / Done');
    expect(formatStandup(mockData, 'plain')).toContain('YESTERDAY / DONE:');
  });
});
