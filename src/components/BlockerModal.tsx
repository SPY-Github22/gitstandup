import React, { useState } from 'react';
import { X, AlertOctagon, Plus, Check, Trash2 } from 'lucide-react';
import { StandupBlocker } from '../core/types';

interface BlockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockers: StandupBlocker[];
  onAddBlocker: (text: string, ticketId?: string) => void;
  onToggleResolve: (id: string) => void;
  onDeleteBlocker: (id: string) => void;
}

export const BlockerModal: React.FC<BlockerModalProps> = ({
  isOpen,
  onClose,
  blockers,
  onAddBlocker,
  onToggleResolve,
  onDeleteBlocker,
}) => {
  const [newText, setNewText] = useState('');
  const [newTicket, setNewTicket] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddBlocker(newText.trim(), newTicket.trim() || undefined);
    setNewText('');
    setNewTicket('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Blocker & Dependency Manager</h2>
              <p className="text-xs text-neutral-400">Track blockers for daily standup updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Blocker Form */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-neutral-800 bg-neutral-950/40 space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Blocker Description
            </label>
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g. Waiting on staging AWS IAM permissions..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Related Ticket (Optional)
              </label>
              <input
                type="text"
                value={newTicket}
                onChange={(e) => setNewTicket(e.target.value)}
                placeholder="e.g. ENG-502 or #88"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <button
              type="submit"
              disabled={!newText.trim()}
              className="mt-5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded font-medium text-xs flex items-center gap-1 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Existing Blockers List */}
        <div className="p-4 max-h-[300px] overflow-y-auto space-y-2">
          {blockers.length === 0 ? (
            <p className="text-center py-6 text-xs text-neutral-500">
              No active blockers. Clear to proceed! 🎉
            </p>
          ) : (
            blockers.map((b) => (
              <div
                key={b.id}
                className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                  b.resolved
                    ? 'bg-neutral-950/40 border-neutral-800 text-neutral-500 line-through'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => onToggleResolve(b.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                      b.resolved
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-neutral-600 hover:border-neutral-400'
                    }`}
                    title={b.resolved ? 'Mark unresolved' : 'Mark resolved'}
                  >
                    {b.resolved && <Check className="w-3 h-3" />}
                  </button>
                  <span className="font-medium">{b.text}</span>
                  {b.ticketId && (
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-neutral-800 text-amber-400 border border-neutral-700">
                      {b.ticketId}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onDeleteBlocker(b.id)}
                  className="p-1 text-neutral-500 hover:text-red-400 transition"
                  title="Delete blocker"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
