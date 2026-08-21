import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function VaultScreen() {
  const {
    problems,
    searchTerm,
    setSearchTerm,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedLanguage,
    setSelectedLanguage,
    sortBy,
    setSortBy,
    setIsSnippetModalOpen,
    deleteProblem,
    addToast
  } = useApp();

  const [expandedId, setExpandedId] = useState(null);

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'border-primary/50 text-primary bg-primary/10';
      case 'Medium':
        return 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10';
      case 'Hard':
        return 'border-error/50 text-error bg-error/10';
      default:
        return 'border-outline text-on-surface-variant bg-surface-container';
    }
  };

  const copyCode = (code, name) => {
    navigator.clipboard.writeText(code);
    addToast(`Copied ${name} code to clipboard.`, 'info');
  };

  return (
    <div className="p-md md:p-lg max-w-[1440px] mx-auto w-full screen-enter">
      {/* Header */}
      <header className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md border-b border-outline-variant pb-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs font-bold tracking-tight">
            The Vault
          </h2>
          <p className="font-code-sm text-code-sm text-on-surface-variant flex items-center gap-1.5">
            <span className="text-primary font-bold">&gt;</span> {problems.length} Problems Stored in SQLite
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-sm w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search problems..."
              className="w-full bg-[#080808] border border-outline-variant rounded-lg py-2 pl-9 pr-4 font-code-sm text-xs text-on-surface focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-sm">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-surface-container border border-outline-variant rounded-lg py-2 px-3 font-code-sm text-xs text-on-surface focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="All">Difficulty: All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-surface-container border border-outline-variant rounded-lg py-2 px-3 font-code-sm text-xs text-on-surface focus:outline-none focus:border-primary transition-all cursor-pointer hidden sm:block"
            >
              <option value="All">Language: All</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="Rust">Rust</option>
              <option value="Go">Go</option>
            </select>

            <button
              onClick={() => setIsSnippetModalOpen(true)}
              className="bg-primary-container text-black font-bold px-3 py-2 rounded-lg text-xs font-label-caps flex items-center gap-1 hover:bg-primary transition-colors cursor-pointer shadow-neon-glow"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>ADD</span>
            </button>
          </div>
        </div>
      </header>

      {/* Controls Row */}
      <div className="flex justify-between items-center mb-md flex-wrap gap-2">
        <div className="flex gap-sm flex-wrap items-center">
          {selectedDifficulty !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#121212] border border-outline-variant font-code-sm text-xs text-on-surface">
              {selectedDifficulty}
              <span 
                onClick={() => setSelectedDifficulty('All')} 
                className="material-symbols-outlined text-xs cursor-pointer hover:text-error ml-1"
              >
                close
              </span>
            </span>
          )}
          {selectedLanguage !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#121212] border border-outline-variant font-code-sm text-xs text-on-surface">
              {selectedLanguage}
              <span 
                onClick={() => setSelectedLanguage('All')} 
                className="material-symbols-outlined text-xs cursor-pointer hover:text-error ml-1"
              >
                close
              </span>
            </span>
          )}
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#121212] border border-outline-variant font-code-sm text-xs text-on-surface">
              Query: "{searchTerm}"
              <span 
                onClick={() => setSearchTerm('')} 
                className="material-symbols-outlined text-xs cursor-pointer hover:text-error ml-1"
              >
                close
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-sm ml-auto">
          <span className="font-code-sm text-xs text-on-surface-variant hidden sm:inline">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none py-1 pl-2 pr-6 font-code-sm text-xs text-primary focus:ring-0 cursor-pointer font-bold"
          >
            <option className="bg-[#121212] text-on-surface" value="Newest">Newest</option>
            <option className="bg-[#121212] text-on-surface" value="Oldest">Oldest</option>
            <option className="bg-[#121212] text-on-surface" value="Most Efficient">Most Efficient</option>
            <option className="bg-[#121212] text-on-surface" value="Difficulty">Difficulty</option>
          </select>
        </div>
      </div>

      {/* Problem List */}
      <div className="space-y-3">
        {problems.length === 0 ? (
          <div className="card-surface rounded-xl p-12 text-center border border-outline-variant">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
              inventory_2
            </span>
            <h4 className="font-headline-md text-base font-bold text-on-surface">No problems found</h4>
            <p className="font-code-sm text-xs text-on-surface-variant mt-1 mb-4">
              Try adjusting your search criteria or add a new snippet.
            </p>
            <button
              onClick={() => setIsSnippetModalOpen(true)}
              className="bg-primary-container text-black font-bold px-4 py-2 rounded-lg text-xs font-label-caps inline-flex items-center gap-1.5 shadow-neon-glow"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              CREATE FIRST PROBLEM
            </button>
          </div>
        ) : (
          problems.map((p) => {
            const isExpanded = expandedId === p.id;
            return (
              <div
                key={p.id}
                className="card-surface rounded-lg p-4 border border-outline-variant hover:border-primary/60 transition-all cursor-pointer group glow-hover"
                onClick={() => setExpandedId(isExpanded ? null : p.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left info */}
                  <div className="flex-1">
                    <h3 className="font-body-md text-base font-semibold text-on-surface group-hover:text-primary transition-colors mb-1.5 truncate">
                      {p.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`font-code-sm text-[11px] px-2 py-0.5 rounded border ${getDifficultyBadge(p.difficulty)} font-bold`}>
                        {p.difficulty}
                      </span>
                      <span className="font-code-sm text-[11px] px-2 py-0.5 rounded border border-outline-variant bg-[#080808] text-on-surface-variant">
                        {p.language}
                      </span>
                      <span className="font-code-sm text-[11px] text-on-surface-variant ml-1">
                        <span className="text-secondary font-semibold">{p.time_complexity || 'O(n)'}</span> Time
                      </span>
                      <span className="font-code-sm text-[11px] text-on-surface-variant">
                        <span className="text-secondary font-semibold">{p.space_complexity || 'O(1)'}</span> Space
                      </span>
                    </div>
                  </div>

                  {/* Right metrics */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                    <div className="text-right hidden md:block">
                      <div className="font-code-sm text-sm font-bold text-on-surface">{p.runtime_ms || 12}ms</div>
                      <div className="font-code-sm text-[10px] text-on-surface-variant uppercase">Runtime</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="font-code-sm text-xs text-on-surface">{p.solved_at || 'Recently'}</div>
                      <div className="font-code-sm text-[10px] text-on-surface-variant uppercase">Status</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : p.id);
                      }}
                      className={`p-2 rounded border transition-all ${
                        isExpanded
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline-variant text-on-surface hover:border-primary hover:text-primary'
                      }`}
                      title={isExpanded ? 'Collapse' : 'Expand Code'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {isExpanded ? 'expand_less' : 'code'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Expanded Code & Details Drawer */}
                {isExpanded && (
                  <div
                    className="mt-4 pt-4 border-t border-outline-variant/60 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.notes && (
                      <div className="mb-3 p-2.5 bg-[#080808] rounded border border-outline-variant text-xs font-code-sm text-primary flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">psychology</span>
                        <span>{p.notes}</span>
                      </div>
                    )}

                    {/* Code Container */}
                    <div className="relative bg-[#050505] rounded-lg border border-outline-variant overflow-hidden">
                      <div className="px-3 py-1.5 bg-[#121212] border-b border-outline-variant flex justify-between items-center text-xs font-code-sm text-on-surface-variant">
                        <span>{p.language} Solution</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyCode(p.code, p.name)}
                            className="p-1 hover:text-primary transition-colors flex items-center gap-1"
                            title="Copy code"
                          >
                            <span className="material-symbols-outlined text-xs">content_copy</span>
                            <span className="text-[10px] uppercase font-label-caps">COPY</span>
                          </button>
                          <button
                            onClick={() => deleteProblem(p.id, p.name)}
                            className="p-1 hover:text-error transition-colors flex items-center gap-1 text-on-surface-variant"
                            title="Delete problem"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                            <span className="text-[10px] uppercase font-label-caps">DELETE</span>
                          </button>
                        </div>
                      </div>
                      <pre className="p-4 text-xs font-code-sm font-mono text-on-surface overflow-x-auto leading-relaxed selection:bg-primary selection:text-black">
                        <code>{p.code || '// No source code implementation provided'}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
