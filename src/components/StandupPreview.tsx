import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Eye,
  FileCode,
  Tag,
  Smile,
  Hash
} from 'lucide-react';
import {
  StandupData,
  StandupFormat,
  StandupGeneratorOptions
} from '../core/types';
import { formatStandup } from '../core/formatters';

interface StandupPreviewProps {
  data: StandupData;
  onAddBlocker: () => void;
}

export const StandupPreview: React.FC<StandupPreviewProps> = ({ data, onAddBlocker }) => {
  const [format, setFormat] = useState<StandupFormat>('slack');
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');
  const [copied, setCopied] = useState(false);

  // Formatter options
  const [includeTicketIds, setIncludeTicketIds] = useState(true);
  const [includeRepoTags, setIncludeRepoTags] = useState(true);
  const [includeEmoji, setIncludeEmoji] = useState(true);

  const options: StandupGeneratorOptions = useMemo(() => ({
    includeTicketIds,
    includeRepoTags,
    includeEmoji,
  }), [includeTicketIds, includeRepoTags, includeEmoji]);

  const formattedText = useMemo(() => {
    return formatStandup(data, format, options);
  }, [data, format, options]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === 'markdown' ? 'md' : 'txt';
    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `standup-${new Date().toISOString().slice(0, 10)}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalItems = data.done.length + data.inProgress.length + data.blockers.filter(b => !b.resolved).length;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Top Controls Header */}
      <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900/80 flex flex-wrap items-center justify-between gap-3">
        {/* Format Selector */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
          {(['slack', 'markdown', 'jira', 'plain'] as StandupFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`px-3 py-1 rounded-md font-medium capitalize transition ${
                format === fmt
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {fmt === 'slack' ? 'Slack / Discord' : fmt}
            </button>
          ))}
        </div>

        {/* View Toggle (Visual vs Raw Code) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-950 p-0.5 rounded-md border border-neutral-800 text-xs">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition ${
                viewMode === 'visual'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Rendered visual layout"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visual</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition ${
                viewMode === 'raw'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Raw export markup"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Raw</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition"
            title="Copy formatted standup to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Standup'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md border border-neutral-700 transition"
            title="Download standup file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formatting Options Bar */}
      <div className="px-4 py-2 border-b border-neutral-800/80 bg-neutral-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-neutral-300">
          <button
            onClick={() => setIncludeTicketIds(!includeTicketIds)}
            className={`flex items-center gap-1 text-[11px] font-medium transition ${
              includeTicketIds ? 'text-emerald-400' : 'text-neutral-500 line-through'
            }`}
          >
            <Hash className="w-3 h-3" />
            <span>Ticket IDs</span>
          </button>

          <button
            onClick={() => setIncludeRepoTags(!includeRepoTags)}
            className={`flex items-center gap-1 text-[11px] font-medium transition ${
              includeRepoTags ? 'text-emerald-400' : 'text-neutral-500 line-through'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>Repo Tags</span>
          </button>

          <button
            onClick={() => setIncludeEmoji(!includeEmoji)}
            className={`flex items-center gap-1 text-[11px] font-medium transition ${
              includeEmoji ? 'text-emerald-400' : 'text-neutral-500 line-through'
            }`}
          >
            <Smile className="w-3 h-3" />
            <span>Emoji Headers</span>
          </button>
        </div>

        <button
          onClick={onAddBlocker}
          className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
        >
          + Add Blocker
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-auto p-4 bg-neutral-950">
        {totalItems === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
            <Clock className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs font-medium">No commits detected in this timeframe</p>
            <p className="text-[11px] text-neutral-600 mt-1">
              Paste commits on the left or select a preset to generate your standup update.
            </p>
          </div>
        ) : viewMode === 'raw' ? (
          <pre className="font-mono text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed selection:bg-emerald-500/30">
            {formattedText}
          </pre>
        ) : (
          <div className="space-y-6 text-xs">
            {/* Yesterday / Done Section */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Yesterday / Done
                </span>
                <span className="text-[11px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                  {data.done.length} item{data.done.length === 1 ? '' : 's'}
                </span>
              </div>

              {data.done.length === 0 ? (
                <p className="text-neutral-500 italic text-xs py-1">No completed commits in this window</p>
              ) : (
                <ul className="space-y-2 pt-1">
                  {data.done.map((item) => (
                    <li key={item.id} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <div className="flex-1">
                        <div className="flex items-baseline flex-wrap gap-1.5">
                          {includeRepoTags && item.repo && item.repo !== 'main-repo' && (
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                              {item.repo}
                            </span>
                          )}
                          <span className="text-neutral-200 font-medium">{item.text}</span>
                          {includeTicketIds && item.ticketId && (
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                              {item.ticketId}
                            </span>
                          )}
                        </div>
                        {item.commits.length > 1 && (
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                            Combined {item.commits.length} commits ({item.commits.map(c => c.hash).join(', ')})
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Today / In Progress Section */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Today / In Progress
                </span>
                <span className="text-[11px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                  {data.inProgress.length} item{data.inProgress.length === 1 ? '' : 's'}
                </span>
              </div>

              {data.inProgress.length === 0 ? (
                <p className="text-neutral-500 italic text-xs py-1">Continuing active sprint objectives</p>
              ) : (
                <ul className="space-y-2 pt-1">
                  {data.inProgress.map((item) => (
                    <li key={item.id} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <div className="flex-1">
                        <div className="flex items-baseline flex-wrap gap-1.5">
                          {includeRepoTags && item.repo && item.repo !== 'main-repo' && (
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                              {item.repo}
                            </span>
                          )}
                          <span className="text-neutral-200 font-medium">{item.text}</span>
                          {includeTicketIds && item.ticketId && (
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                              {item.ticketId}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Blockers Section */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                  Blockers & Dependencies
                </span>
                <span className="text-[11px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                  {data.blockers.filter(b => !b.resolved).length} active
                </span>
              </div>

              {data.blockers.filter(b => !b.resolved).length === 0 ? (
                <p className="text-neutral-500 italic text-xs py-1">No active blockers</p>
              ) : (
                <ul className="space-y-2 pt-1">
                  {data.blockers.filter(b => !b.resolved).map((b) => (
                    <li key={b.id} className="flex items-start gap-2 text-amber-300/90 bg-amber-950/20 border border-amber-900/30 p-2 rounded">
                      <span>⚠️</span>
                      <span className="flex-1 font-medium">{b.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
