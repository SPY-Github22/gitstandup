import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { CommitInput } from './components/CommitInput';
import { StandupPreview } from './components/StandupPreview';
import { BlockerModal } from './components/BlockerModal';
import { parseGitLog } from './core/commitParser';
import { synthesizeStandup } from './core/standupSynthesizer';
import { TimeframeFilter, StandupBlocker } from './core/types';

const PRESETS = {
  sprint: `a1b2c3d [backend] feat(auth): implement refresh token rotation [AUTH-201]
e5f6789 [backend] test(auth): add edge case token expiration tests [AUTH-201]
b9c8d7e [frontend] feat(ui): build session timeout warning banner [AUTH-204]
3a4b5c6 [backend] fix(db): increase max connection pool to 50
7f8a9b0 [frontend] chore: bump tailwindcss from 3.3 to 3.4`,

  multirepo: `[api-gateway] 4f5e6d7 feat: add rate limiting middleware for public endpoints [GATEWAY-12]
[auth-service] 1a2b3c4 fix: handle null user profile gracefully in JWT verify
[web-dashboard] 8c9d0e1 feat(billing): integrate stripe checkout webhook [PAY-89]
[web-dashboard] 9f0a1b2 test: add e2e checkout flow tests [PAY-89]`,

  solo: `f1e2d3c feat: implement search filter autocomplete dropdown
d4c3b2a fix: debounce search input by 300ms
b5a6c7d test: add search index ranking unit tests`,
};

export function App() {
  const [rawText, setRawText] = useState(PRESETS.sprint);
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('all');
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);

  const [blockers, setBlockers] = useState<StandupBlocker[]>([
    {
      id: 'blocker_init_1',
      text: 'Awaiting staging AWS IAM role credentials from DevOps',
      resolved: false,
      ticketId: 'DEVOPS-410',
    },
  ]);

  // Parse raw text into structured commits
  const allParsedCommits = useMemo(() => {
    return parseGitLog(rawText);
  }, [rawText]);

  // Unique detected repositories
  const uniqueRepos = useMemo(() => {
    const set = new Set(allParsedCommits.map(c => c.repo).filter(r => r && r !== 'main-repo'));
    return Array.from(set);
  }, [allParsedCommits]);

  // Filter commits by selected repository if any
  const commitsForSynthesizer = useMemo(() => {
    if (!selectedRepo) return allParsedCommits;
    return allParsedCommits.filter(c => c.repo === selectedRepo);
  }, [allParsedCommits, selectedRepo]);

  // Synthesize standup data
  const standupData = useMemo(() => {
    return synthesizeStandup(commitsForSynthesizer, blockers, timeframe);
  }, [commitsForSynthesizer, blockers, timeframe]);

  // Blocker handlers
  const handleAddBlocker = (text: string, ticketId?: string) => {
    const newB: StandupBlocker = {
      id: `b_${Date.now()}`,
      text,
      resolved: false,
      ticketId,
    };
    setBlockers(prev => [newB, ...prev]);
  };

  const handleToggleResolveBlocker = (id: string) => {
    setBlockers(prev =>
      prev.map(b => (b.id === id ? { ...b, resolved: !b.resolved } : b))
    );
  };

  const handleDeleteBlocker = (id: string) => {
    setBlockers(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Header
        onLoadPreset={(key) => setRawText(PRESETS[key])}
        commitCount={allParsedCommits.length}
      />

      {/* Main Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Input Stream */}
        <section className="h-[calc(100vh-5rem)]">
          <CommitInput
            rawText={rawText}
            onChangeRawText={setRawText}
            timeframe={timeframe}
            onChangeTimeframe={setTimeframe}
            parsedCommits={allParsedCommits}
            uniqueRepos={uniqueRepos}
            selectedRepo={selectedRepo}
            onSelectRepo={setSelectedRepo}
            onClear={() => setRawText('')}
          />
        </section>

        {/* Right Column: Output & Formatter */}
        <section className="h-[calc(100vh-5rem)]">
          <StandupPreview
            data={standupData}
            onAddBlocker={() => setIsBlockerModalOpen(true)}
          />
        </section>
      </main>

      {/* Blocker Modal */}
      <BlockerModal
        isOpen={isBlockerModalOpen}
        onClose={() => setIsBlockerModalOpen(false)}
        blockers={blockers}
        onAddBlocker={handleAddBlocker}
        onToggleResolve={handleToggleResolveBlocker}
        onDeleteBlocker={handleDeleteBlocker}
      />
    </div>
  );
}
