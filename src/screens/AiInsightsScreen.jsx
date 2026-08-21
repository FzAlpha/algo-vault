import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AiInsightsScreen() {
  const { aiInsights, addToast, setCurrentScreen } = useApp();
  const [showOptimized, setShowOptimized] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [queryOutput, setQueryOutput] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analysis = aiInsights?.analysis || {
    title: 'Deep Dive Analysis: Substring Matcher',
    language: 'Python',
    detectedComplexity: 'O(N^2) Detected',
    targetFunction: `def find_longest_substring(s: str) -> int:
    n = len(s)
    res = 0
    for i in range(n):
        for j in range(i, n):
            if check_repetition(s, i, j):
                res = max(res, j - i + 1)
    return res`,
    optimizedFunction: `def find_longest_substring_optimized(s: str) -> int:
    char_index = {}
    left = max_len = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
    timeImprovement: 'O(N²) -> O(N)',
    spaceTradeoff: 'O(1) -> O(min(m, n))',
    speedup: '94.8% latency reduction on N=10,000'
  };

  const recommendations = aiInsights?.recommendations || [
    { title: 'Minimum Window Substring', difficulty: 'Hard', pattern: 'Sliding Window', reason: 'Consolidates two-pointer boundary contraction logic' },
    { title: 'Longest Repeating Character Replacement', difficulty: 'Medium', pattern: 'Sliding Window + Frequency Map', reason: 'Reinforces dynamic window expansion heuristics' },
    { title: 'Fruit Into Baskets', difficulty: 'Medium', pattern: 'Sliding Window', reason: 'Direct application of max length condition checks' }
  ];

  const handleQuery = () => {
    if (!queryInput.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setQueryOutput({
        prompt: queryInput,
        response: `Optimal pattern for "${queryInput}": Apply two-pointer greedy window with monotonic queue. Time complexity guaranteed O(N), Space O(K).`,
        confidence: '98.4%'
      });
      addToast('AI heuristic analysis complete.', 'success');
    }, 800);
  };

  return (
    <div className="p-md md:p-lg max-w-[1440px] mx-auto w-full screen-enter space-y-gutter">
      {/* AI Command Center Header */}
      <div className="bg-[#121212] border border-[#1F2937] rounded-lg p-lg relative overflow-hidden ai-border glow-ai">
        <div className="scan-beam"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-[#a855f7] mb-1 flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-3xl">psychiatry</span>
              Intelligence Core
            </h2>
            <p className="font-code-sm text-code-sm text-outline">
              Real-time heuristic analysis and predictive optimization engine.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-black border border-[#1F2937] rounded p-2.5 flex flex-col items-end">
              <span className="font-label-caps text-[10px] text-outline mb-0.5 uppercase">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-container animate-ping"></div>
                <span className="font-code-sm text-xs text-primary-container font-bold">Engine Active</span>
              </div>
            </div>
            <div className="bg-black border border-[#1F2937] rounded p-2.5 flex flex-col items-end">
              <span className="font-label-caps text-[10px] text-outline mb-0.5 uppercase">Model</span>
              <span className="font-code-sm text-xs text-[#a855f7] font-bold">vault-v2-optimized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Deep Dive Analysis (Code Snippet Box) - 8 cols */}
        <div className="col-span-12 xl:col-span-8 bg-[#121212] border border-[#1F2937] rounded-lg border-t border-t-[#2f372f] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#1F2937] flex flex-wrap justify-between items-center bg-black/60 gap-2">
            <h3 className="font-headline-md text-base text-on-surface font-bold">
              {analysis.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-surface-variant text-outline font-label-caps text-[11px] rounded">
                {analysis.language}
              </span>
              <span className={`px-2 py-0.5 font-label-caps text-[11px] rounded border ${
                showOptimized 
                  ? 'bg-primary/10 text-primary border-primary'
                  : 'bg-error/10 text-error border-error'
              }`}>
                {showOptimized ? 'O(N) Optimized' : analysis.detectedComplexity}
              </span>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-6 bg-[#080808] flex-1 font-code-sm text-xs md:text-sm overflow-x-auto relative group leading-relaxed">
            {!showOptimized ? (
              <div>
                <pre className="text-on-surface-variant font-mono">
                  <code>
{`def find_longest_substring(s: str) -> int:
    n = len(s)
    res = 0
    `}
<span className="bg-error/20 border-b border-error text-error font-semibold px-1" title="Nested loop detected: O(N^2) complexity.">for i in range(n):</span>
{`
        `}
<span className="bg-error/20 border-b border-error text-error font-semibold px-1" title="Nested loop detected: O(N^2) complexity.">for j in range(i, n):</span>
{`
            if check_repetition(s, i, j):
                res = max(res, j - i + 1)
    return res`}
                  </code>
                </pre>

                <div className="mt-4 pt-3 border-t border-outline-variant/30 text-xs font-code-sm text-outline italic">
                  # AI Heat Zone Annotation:<br />
                  # The inner loop forces redundant checks. A sliding window<br />
                  # approach utilizing a hash set will linearize this operation.
                </div>

                {/* Floating AI Suggestion */}
                <div className="mt-6 bg-[#121212] border border-[#a855f7] p-3.5 rounded-lg flex items-center justify-between shadow-lg shadow-[#a855f7]/15">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#a855f7]">lightbulb</span>
                    <span className="font-code-sm text-xs text-on-surface font-semibold">
                      Optimize with Sliding Window
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowOptimized(true);
                      addToast('Applied Sliding Window optimization pattern.', 'success');
                    }}
                    className="bg-[#a855f7]/20 text-[#a855f7] px-3 py-1.5 rounded font-label-caps text-xs font-bold border border-[#a855f7]/50 hover:bg-[#a855f7]/40 transition-colors cursor-pointer"
                  >
                    APPLY FIX
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <pre className="text-primary font-mono">
                  <code>{analysis.optimizedFunction}</code>
                </pre>

                <div className="mt-4 pt-3 border-t border-outline-variant/30 text-xs font-code-sm text-primary flex items-center justify-between">
                  <span>✓ Solution linearized to O(N) single-pass execution.</span>
                  <button
                    onClick={() => setShowOptimized(false)}
                    className="text-xs text-on-surface-variant hover:text-on-surface underline font-label-caps cursor-pointer"
                  >
                    REVERT TO BASELINE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Predictive Refactoring & Complexity Comparison - 4 cols */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-gutter">
          {/* Metrics comparison card */}
          <div className="bg-[#121212] border border-[#1F2937] rounded-lg p-lg">
            <h3 className="font-label-caps text-xs text-secondary uppercase tracking-widest font-bold mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              COMPLEXITY DELTA
            </h3>

            <div className="space-y-4">
              <div className="p-3 bg-[#080808] rounded border border-outline-variant">
                <div className="text-[10px] font-label-caps text-on-surface-variant uppercase">Time Complexity</div>
                <div className="text-sm font-code-sm font-bold text-on-surface mt-1 flex items-center justify-between">
                  <span className="text-error line-through">O(N²)</span>
                  <span className="material-symbols-outlined text-xs text-primary">arrow_forward</span>
                  <span className="text-primary font-bold">O(N)</span>
                </div>
              </div>

              <div className="p-3 bg-[#080808] rounded border border-outline-variant">
                <div className="text-[10px] font-label-caps text-on-surface-variant uppercase">Space Trade-off</div>
                <div className="text-sm font-code-sm font-bold text-on-surface mt-1 flex items-center justify-between">
                  <span className="text-on-surface-variant">O(1)</span>
                  <span className="material-symbols-outlined text-xs text-secondary">arrow_forward</span>
                  <span className="text-secondary font-bold">O(min(m, n))</span>
                </div>
              </div>

              <div className="p-3 bg-[#080808] rounded border border-outline-variant">
                <div className="text-[10px] font-label-caps text-on-surface-variant uppercase">Empirical Benchmark</div>
                <div className="text-xs font-code-sm text-primary font-bold mt-1">
                  {analysis.speedup}
                </div>
              </div>
            </div>
          </div>

          {/* AI Interactive Query Input */}
          <div className="bg-[#121212] border border-[#1F2937] rounded-lg p-lg flex flex-col justify-between">
            <h3 className="font-label-caps text-xs text-on-surface uppercase tracking-widest font-bold mb-2">
              Heuristic Query Engine
            </h3>
            <p className="text-xs text-on-surface-variant mb-3 font-code-sm">
              Input algorithmic problem or code snippet for real-time complexity analysis.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="e.g. Find Kth largest in stream"
                className="w-full bg-[#080808] border border-outline-variant rounded px-3 py-2 text-xs font-code-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              />
              <button
                onClick={handleQuery}
                disabled={analyzing || !queryInput.trim()}
                className="w-full py-2 rounded bg-secondary-container text-white font-label-caps text-xs font-bold hover:bg-secondary hover:text-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span>{analyzing ? 'ANALYZING HEURISTICS...' : 'ANALYZE PATTERN'}</span>
              </button>
            </div>

            {queryOutput && (
              <div className="mt-3 p-3 rounded bg-[#080808] border border-secondary/40 text-xs font-code-sm text-secondary animate-fadeIn">
                <div className="font-bold mb-1">AI Recommendation ({queryOutput.confidence}):</div>
                <p className="text-on-surface-variant leading-relaxed">{queryOutput.response}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Practice Problems based on heuristics */}
      <div className="bg-[#121212] border border-[#1F2937] rounded-lg p-lg">
        <h3 className="font-label-caps text-xs text-on-surface uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">recommend</span>
          RECOMMENDED NEXT PROBLEMS (PATTERN REINFORCEMENT)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentScreen('vault')}
              className="p-4 bg-[#080808] border border-outline-variant rounded-lg hover:border-secondary/60 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-headline-md text-sm text-on-surface group-hover:text-primary font-bold">
                  {rec.title}
                </h4>
                <span className={`text-[10px] font-label-caps px-1.5 py-0.5 rounded border ${
                  rec.difficulty === 'Hard' ? 'border-error/40 text-error' : 'border-yellow-500/40 text-yellow-400'
                }`}>
                  {rec.difficulty}
                </span>
              </div>
              <div className="font-code-sm text-xs text-secondary mb-1">
                Pattern: {rec.pattern}
              </div>
              <p className="font-code-sm text-[11px] text-on-surface-variant leading-relaxed">
                {rec.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
