import React, { useState } from 'react';
import { Terminal, Copy, Check, Filter, Trash2, GitCommit as GitCommitIcon, FolderGit2 } from 'lucide-react';
import { TimeframeFilter, GitCommit } from '../core/types';

interface CommitInputProps {
  rawText: string;
  onChangeRawText: (text: string) => void;
  timeframe: TimeframeFilter;
  onChangeTimeframe: (tf: TimeframeFilter) => void;
  parsedCommits: GitCommit[];
  uniqueRepos: string[];
  selectedRepo: string | null;
  onSelectRepo: (repo: string | null) => void;
  onClear: () => void;
}

export const CommitInput: React.FC<CommitInputProps> = ({
  rawText,
  onChangeRawText,
  timeframe,
  onChangeTimeframe,
  parsedCommits,
  uniqueRepos,
  selectedRepo,
  onSelectRepo,
  onClear,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);

  const gitCommandSnippet = `git log --since="yesterday" --pretty=format:"%h|%an|%ad|%s"`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(gitCommandSnippet);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Top Toolbar */}
      <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Git Commit Stream
          </span>
        </div>

        {/* Quick Shell Command Copy */}
        <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[11px] font-mono">
          <code className="text-emerald-400/90 truncate max-w-[220px]">
            {gitCommandSnippet}
          </code>
          <button
            onClick={handleCopyCmd}
            className="p-1 hover:text-white text-neutral-400 transition"
            title="Copy command to run in your repository terminal"
          >
            {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Timeframe & Filters Bar */}
      <div className="px-4 py-2 border-b border-neutral-800/80 bg-neutral-950/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Timeframe Tabs */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs">
          <span className="text-neutral-500 px-1 text-[11px] font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Window:
          </span>
          {(['all', 'today', 'yesterday', 'last7days'] as TimeframeFilter[]).map((tf) => (
            <button
              key={tf}
              onClick={() => onChangeTimeframe(tf)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition ${
                timeframe === tf
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tf === 'last7days' ? 'Last 7 Days' : tf}
            </button>
          ))}
        </div>

        {/* Clear Button */}
        {rawText && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-red-400 transition"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Repo Filter Chips */}
      {uniqueRepos.length > 1 && (
        <div className="px-4 py-1.5 border-b border-neutral-800/60 bg-neutral-950/40 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-neutral-500 text-[10px] uppercase font-semibold flex items-center gap-1">
            <FolderGit2 className="w-3 h-3" />
            Repo:
          </span>
          <button
            onClick={() => onSelectRepo(null)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
              selectedRepo === null
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Repos ({parsedCommits.length})
          </button>
          {uniqueRepos.map((repo) => (
            <button
              key={repo}
              onClick={() => onSelectRepo(repo === selectedRepo ? null : repo)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                selectedRepo === repo
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {repo}
            </button>
          ))}
        </div>
      )}

      {/* Raw Textarea */}
      <div className="flex-1 p-3 flex flex-col min-h-[220px]">
        <textarea
          value={rawText}
          onChange={(e) => onChangeRawText(e.target.value)}
          placeholder={`Paste terminal git log here...\n\nExample formats supported:\n• a1b2c3d feat(auth): add OAuth2 provider [ENG-101]\n• a1b2c3d|Author|Date|feat: message\n• Full "commit a1b2c3d... Author: ... Date: ..."\n• [backend] fix(db): query timeout`}
          className="w-full flex-1 bg-neutral-950 border border-neutral-800 rounded-lg p-3 font-mono text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed selection:bg-emerald-500/30"
          spellCheck={false}
        />
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <GitCommitIcon className="w-3.5 h-3.5 text-neutral-500" />
            <strong className="text-white font-mono">{parsedCommits.length}</strong> commits parsed
          </span>
          {uniqueRepos.length > 0 && (
            <span>
              <strong className="text-white font-mono">{uniqueRepos.length}</strong> repo{uniqueRepos.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <span className="text-[11px] text-neutral-500">Auto-parses on paste</span>
      </div>
    </div>
  );
};
