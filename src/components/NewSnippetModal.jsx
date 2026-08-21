import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function NewSnippetModal() {
  const { isSnippetModalOpen, setIsSnippetModalOpen, addProblem } = useApp();

  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState('Python');
  const [timeComplexity, setTimeComplexity] = useState('O(n)');
  const [spaceComplexity, setSpaceComplexity] = useState('O(1)');
  const [runtimeMs, setRuntimeMs] = useState(15);
  const [tags, setTags] = useState('Array, Two Pointers');
  const [notes, setNotes] = useState('');
  const [code, setCode] = useState(`class Solution:\n    def solve(self, nums: list[int]) -> int:\n        # Write optimized solution\n        pass`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isSnippetModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const success = await addProblem({
      name: name.trim(),
      difficulty,
      language,
      time_complexity: timeComplexity,
      space_complexity: spaceComplexity,
      runtime_ms: parseInt(runtimeMs, 10) || 10,
      tags: tags.trim(),
      notes: notes.trim(),
      code: code.trim()
    });

    setIsSubmitting(false);
    if (success) {
      setName('');
      setNotes('');
      setIsSnippetModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="card-surface border border-outline-variant rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl relative glow-primary flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-surface-container border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">terminal</span>
            <h3 className="font-headline-md text-base font-bold text-primary tracking-tight">
              SAVE NEW ALGO-SNIPPET
            </h3>
          </div>
          <button
            onClick={() => setIsSnippetModalOpen(false)}
            className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">
                Problem Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Container With Most Water"
                className="w-full bg-[#080808] border border-outline-variant rounded px-3 py-2 text-sm text-on-surface font-code-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[#080808] border border-outline-variant rounded px-3 py-2 text-sm text-on-surface font-code-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#080808] border border-outline-variant rounded px-2.5 py-1.5 text-xs text-on-surface font-code-sm focus:outline-none focus:border-primary"
              >
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="Rust">Rust</option>
                <option value="Go">Go</option>
                <option value="TypeScript">TypeScript</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">
                Time Comp.
              </label>
              <input
                type="text"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                className="w-full bg-[#080808] border border-outline-variant rounded px-2.5 py-1.5 text-xs text-on-surface font-code-sm focus:outline-none focus:border-primary"
                placeholder="O(n)"
              />
            </div>

            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">
                Space Comp.
              </label>
              <input
                type="text"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                className="w-full bg-[#080808] border border-outline-variant rounded px-2.5 py-1.5 text-xs text-on-surface font-code-sm focus:outline-none focus:border-primary"
                placeholder="O(1)"
              />
            </div>

            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">
                Runtime (ms)
              </label>
              <input
                type="number"
                value={runtimeMs}
                onChange={(e) => setRuntimeMs(e.target.value)}
                className="w-full bg-[#080808] border border-outline-variant rounded px-2.5 py-1.5 text-xs text-on-surface font-code-sm focus:outline-none focus:border-primary"
                placeholder="12"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">
              Tags / Algorithms
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Dynamic Programming, Binary Search"
              className="w-full bg-[#080808] border border-outline-variant rounded px-3 py-2 text-xs text-on-surface font-code-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">
              Source Code Implementation
            </label>
            <textarea
              rows={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#080808] border border-outline-variant rounded p-3 text-xs text-on-surface font-code-sm focus:outline-none focus:border-primary font-mono transition-colors"
              placeholder="# Code snippet here..."
            />
          </div>

          <div>
            <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">
              Optimization Notes / Heuristic Findings
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Achieved 98% runtime percentile with custom bitmask."
              className="w-full bg-[#080808] border border-outline-variant rounded px-3 py-2 text-xs text-on-surface font-code-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-outline-variant flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSnippetModalOpen(false)}
              className="px-4 py-2 rounded text-xs font-label-caps text-on-surface-variant hover:text-on-surface border border-outline-variant hover:bg-surface-variant transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded bg-primary-container text-black font-label-caps text-xs font-bold hover:bg-primary transition-all shadow-neon-glow active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>{isSubmitting ? 'PERSISTING...' : 'COMMIT TO SQLITE'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
