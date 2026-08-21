import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function StatisticsScreen() {
  const { user, stats, setIsLeetCodeModalOpen } = useApp();
  const [timeRange, setTimeRange] = useState('1M');

  // Chart data points based on timeRange
  const trendPoints = {
    '1W': [
      { day: 'Mon', speed: 82 },
      { day: 'Tue', speed: 85 },
      { day: 'Wed', speed: 84 },
      { day: 'Thu', speed: 89 },
      { day: 'Fri', speed: 91 },
      { day: 'Sat', speed: 88 },
      { day: 'Sun', speed: 93 },
    ],
    '1M': [
      { day: 'W1', speed: 76 },
      { day: 'W2', speed: 81 },
      { day: 'W3', speed: 85 },
      { day: 'W4', speed: 92 },
      { day: 'W5', speed: 89 },
      { day: 'W6', speed: 94 },
    ],
    '3M': [
      { day: 'M1', speed: 70 },
      { day: 'M2', speed: 78 },
      { day: 'M3', speed: 86 },
      { day: 'M4', speed: 92 },
    ]
  };

  const activePoints = trendPoints[timeRange] || trendPoints['1M'];

  // SVG Polyline / path generator
  const getSvgPath = (points) => {
    const width = 600;
    const height = 180;
    const padding = 30;
    const step = (width - padding * 2) / (points.length - 1);
    
    const coords = points.map((p, idx) => {
      const x = padding + idx * step;
      const y = height - padding - ((p.speed - 60) / 40) * (height - padding * 2);
      return { x, y, val: p.speed, label: p.day };
    });

    const d = coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
    const fillD = `${d} L ${coords[coords.length - 1].x},${height - padding} L ${coords[0].x},${height - padding} Z`;

    return { coords, d, fillD };
  };

  const chart = getSvgPath(activePoints);

  // Dynamic Language Distribution from LeetCode
  const rawLangDist = stats?.languageDistribution || { Python3: 24, Java: 16, 'C++': 8, Rust: 6 };
  const totalLangSolved = Object.values(rawLangDist).reduce((a, b) => a + b, 0) || 1;
  const langColors = ['#6bfb9a', '#ddb7ff', '#ffd9c1', '#3d4a3e', '#4ade80', '#a855f7'];
  
  const langEntries = Object.entries(rawLangDist).map(([lang, count], index) => {
    const pct = Math.round((count / totalLangSolved) * 100);
    return {
      lang,
      count,
      pct,
      color: langColors[index % langColors.length]
    };
  });

  // Dynamic Difficulty Breakdown from LeetCode
  const diffBreakdown = stats?.difficultyBreakdown || { Easy: 22, Medium: 24, Hard: 8 };
  const totalDiffSolved = (diffBreakdown.Easy || 0) + (diffBreakdown.Medium || 0) + (diffBreakdown.Hard || 0) || (user?.problems_solved || 54);
  const easyPct = totalDiffSolved > 0 ? Math.round(((diffBreakdown.Easy || 0) / totalDiffSolved) * 100) : 40;
  const medPct = totalDiffSolved > 0 ? Math.round(((diffBreakdown.Medium || 0) / totalDiffSolved) * 100) : 45;
  const hardPct = totalDiffSolved > 0 ? Math.max(0, 100 - easyPct - medPct) : 15;

  const recentSubs = stats?.recentSubmissions || [
    { id: 'sub-1', title: 'Two Sum', difficulty: 'Easy', language: 'Python', status: 'Accepted', runtime_ms: 12, submitted_at: '2 hours ago' },
    { id: 'sub-2', title: 'Merge k Sorted Lists', difficulty: 'Hard', language: 'Java', status: 'Accepted', runtime_ms: 24, submitted_at: '1 day ago' },
    { id: 'sub-3', title: 'LRU Cache', difficulty: 'Medium', language: 'C++', status: 'Accepted', runtime_ms: 8, submitted_at: '3 days ago' },
  ];

  return (
    <div className="p-md md:p-lg max-w-[1440px] mx-auto w-full screen-enter">
      {/* Header */}
      <div className="mb-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs tracking-tight font-bold">
            Performance Analytics
          </h1>
          <p className="font-code-sm text-code-sm text-on-surface-variant flex items-center gap-2">
            <span>Detailed breakdown of solving metrics_</span>
            {user?.leetcode_username && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary">
                Synced with @{user.leetcode_username}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => setIsLeetCodeModalOpen(true)}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded bg-surface-container border border-outline-variant text-xs font-label-caps text-on-surface hover:text-primary hover:border-primary transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm text-yellow-400">sync</span>
          <span>SYNC LEETCODE</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        {/* Card 1: Total Solving Time */}
        <div className="bg-surface-container border border-outline-variant rounded p-md flex flex-col justify-between h-32 relative overflow-hidden group hover:border-primary transition-colors">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-outline-variant group-hover:bg-primary transition-colors"></div>
          <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">
            Total Solving Time
          </span>
          <div className="flex items-end gap-sm">
            <span className="font-code-sm text-[32px] leading-none font-bold text-on-surface">
              {user?.total_time || '142h 32m'}
            </span>
          </div>
        </div>

        {/* Card 2: Avg. Runtime Percentile */}
        <div className="bg-surface-container border border-outline-variant rounded p-md flex flex-col justify-between h-32 relative overflow-hidden group hover:border-primary transition-colors">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-outline-variant group-hover:bg-primary transition-colors"></div>
          <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">
            Global Rank / Standing
          </span>
          <div className="flex items-end gap-sm">
            <span className="font-code-sm text-[28px] leading-none font-bold text-primary truncate">
              {user?.global_rank_num || '#42'}
            </span>
            <span className="font-label-caps text-[10px] text-primary flex items-center mb-1">
              {user?.global_rank || 'Top 12%'}
            </span>
          </div>
        </div>

        {/* Card 3: Success Rate */}
        <div className="bg-surface-container border border-outline-variant rounded p-md flex flex-col justify-between h-32 relative overflow-hidden group hover:border-primary transition-colors">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-outline-variant group-hover:bg-primary transition-colors"></div>
          <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">
            AC Acceptance Rate
          </span>
          <div className="flex items-end gap-sm">
            <span className="font-code-sm text-[32px] leading-none font-bold text-on-surface">
              {user?.success_rate || 94.2}<span className="text-on-surface-variant text-[20px]">%</span>
            </span>
          </div>
        </div>

        {/* Card 4: Code Efficiency */}
        <div className="bg-surface-container border border-outline-variant rounded p-md flex flex-col justify-between h-32 relative overflow-hidden group hover:border-secondary transition-colors">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-outline-variant group-hover:bg-secondary transition-colors"></div>
          <span className="font-label-caps text-xs text-secondary uppercase tracking-widest flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">bolt</span> Active Streak
          </span>
          <div className="flex items-end gap-sm">
            <span className="font-code-sm text-[32px] leading-none font-bold text-secondary">
              {user?.streak_days || 26} <span className="text-secondary opacity-70 text-[18px]">Days</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md mb-lg">
        {/* Left Column: Performance Trend */}
        <div className="lg:col-span-8 bg-surface-container border border-outline-variant rounded p-md relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-md">
            <div>
              <h3 className="font-label-caps text-xs text-on-surface uppercase tracking-widest font-bold">
                Performance Trend [Speed]
              </h3>
              <p className="font-code-sm text-[11px] text-on-surface-variant">Runtime percentile acceleration curve</p>
            </div>
            <div className="flex gap-sm">
              {['1W', '1M', '3M'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded font-code-sm text-[10px] transition-colors cursor-pointer ${
                    timeRange === range
                      ? 'bg-primary-container/20 border border-primary text-primary font-bold shadow-neon-glow'
                      : 'bg-surface border border-outline-variant text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-grow w-full relative h-64 mt-sm border-l border-b border-outline-variant/60 flex items-center justify-center">
            {/* SVG Line Chart */}
            <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6bfb9a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6bfb9a" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Guidelines */}
              <line x1="0" y1="35" x2="600" y2="35" stroke="#1F2937" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="0" y1="75" x2="600" y2="75" stroke="#1F2937" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="0" y1="115" x2="600" y2="115" stroke="#1F2937" strokeDasharray="3 3" strokeWidth="1" />

              {/* Gradient area */}
              <path d={chart.fillD} fill="url(#chartGrad)" />

              {/* Line stroke */}
              <path d={chart.d} fill="none" stroke="#6bfb9a" strokeWidth="2.5" strokeLinecap="round" />

              {/* Data points */}
              {chart.coords.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#6bfb9a" stroke="#0e150f" strokeWidth="2" />
                  <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#dde5da" fontSize="10" fontFamily="JetBrains Mono">
                    {pt.val}%
                  </text>
                  <text x={pt.x} y={170} textAnchor="middle" fill="#869486" fontSize="10" fontFamily="JetBrains Mono">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Right Column: Language Breakdown */}
        <div className="lg:col-span-4 bg-surface-container border border-outline-variant rounded p-md flex flex-col justify-between">
          <div>
            <h3 className="font-label-caps text-xs text-on-surface uppercase tracking-widest font-bold mb-1">
              Language Distribution
            </h3>
            <p className="font-code-sm text-[11px] text-on-surface-variant mb-4">Total algorithmic footprint from LeetCode</p>
          </div>

          <div className="flex items-center justify-center my-4">
            <div className="w-36 h-36 rounded-full donut-chart flex items-center justify-center shadow-lg relative">
              <div className="w-20 h-20 bg-surface-container rounded-full flex flex-col items-center justify-center">
                <span className="font-code-sm text-sm font-bold text-primary">{user?.problems_solved || totalLangSolved}</span>
                <span className="font-label-caps text-[9px] text-on-surface-variant">SOLVED</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 font-code-sm text-xs max-h-48 overflow-y-auto pr-1">
            {langEntries.map((item) => (
              <div key={item.lang} className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-on-surface truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate">{item.lang}</span>
                </span>
                <span className="text-on-surface-variant text-right flex-shrink-0">
                  {item.pct}% ({item.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
        {/* Difficulty Breakdown */}
        <div className="lg:col-span-5 bg-surface-container border border-outline-variant rounded p-md">
          <h3 className="font-label-caps text-xs text-on-surface uppercase tracking-widest font-bold mb-4">
            Difficulty Mastery (LeetCode Stats)
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-code-sm mb-1">
                <span className="text-primary font-bold">Easy</span>
                <span className="text-on-surface-variant">{diffBreakdown.Easy || 0} Solved ({easyPct}%)</span>
              </div>
              <div className="w-full h-2 bg-[#080808] rounded-full overflow-hidden border border-outline-variant/40">
                <div className="h-full bg-primary rounded-full shadow-neon-glow transition-all duration-500" style={{ width: `${easyPct}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-code-sm mb-1">
                <span className="text-yellow-400 font-bold">Medium</span>
                <span className="text-on-surface-variant">{diffBreakdown.Medium || 0} Solved ({medPct}%)</span>
              </div>
              <div className="w-full h-2 bg-[#080808] rounded-full overflow-hidden border border-outline-variant/40">
                <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${medPct}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-code-sm mb-1">
                <span className="text-error font-bold">Hard</span>
                <span className="text-on-surface-variant">{diffBreakdown.Hard || 0} Solved ({hardPct}%)</span>
              </div>
              <div className="w-full h-2 bg-[#080808] rounded-full overflow-hidden border border-outline-variant/40">
                <div className="h-full bg-error rounded-full transition-all duration-500" style={{ width: `${hardPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="lg:col-span-7 bg-surface-container border border-outline-variant rounded p-md overflow-hidden">
          <h3 className="font-label-caps text-xs text-on-surface uppercase tracking-widest font-bold mb-3">
            Recent Submission Log
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-code-sm">
              <thead>
                <tr className="border-b border-outline-variant text-on-surface-variant uppercase text-[10px]">
                  <th className="pb-2">Problem</th>
                  <th className="pb-2">Language</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Latency</th>
                  <th className="pb-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {recentSubs.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-variant/30">
                    <td className="py-2.5 text-on-surface font-medium truncate max-w-[180px]">{s.title}</td>
                    <td className="py-2.5 text-on-surface-variant">{s.language}</td>
                    <td className="py-2.5">
                      <span className="text-primary text-[10px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30">
                        {s.status || 'Accepted'}
                      </span>
                    </td>
                    <td className="py-2.5 text-secondary">{s.runtime_ms}ms</td>
                    <td className="py-2.5 text-on-surface-variant text-right">{s.submitted_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
