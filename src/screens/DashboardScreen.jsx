import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function DashboardScreen() {
  const { user, problems, stats, setCurrentScreen, setIsSnippetModalOpen, setIsLeetCodeModalOpen } = useApp();
  const [hoveredCell, setHoveredCell] = useState(null);

  // Generate 52 weeks of heatmap data directly from LeetCode synced stats
  const heatmapData = stats?.heatmap || [];
  const weeks = [];
  for (let w = 0; w < 52; w++) {
    const weekDays = [];
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      const entry = heatmapData[idx] || { count: 0, level: 0, date: `Day ${idx + 1}` };
      weekDays.push(entry);
    }
    weeks.push(weekDays);
  }

  const recentProblems = problems.slice(0, 5);

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

  const weeklySolved = stats?.weeklyGoal?.solved || 18;
  const weeklyTotal = stats?.weeklyGoal?.total || 25;
  const weeklyPct = stats?.weeklyGoal?.percentage || 72;

  return (
    <div className="p-lg md:p-xl grid grid-cols-1 md:grid-cols-12 gap-md md:gap-lg max-w-[1440px] mx-auto screen-enter">
      {/* Stats Header (4 Cards) */}
      <div className="col-span-1 md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Card 1: Current Streak (from LeetCode calendar) */}
        <div className="card-surface rounded-xl p-md neon-border top-border-highlight flex items-center gap-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm mb-1 font-body-md">Current Streak</p>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
              {user?.streak_days || 26} Days
            </h3>
          </div>
        </div>

        {/* Card 2: Problems Solved (from LeetCode AC total) */}
        <div className="card-surface rounded-xl p-md neon-border top-border-highlight flex items-center gap-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm mb-1 font-body-md">Problems Solved</p>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
              {user?.problems_solved || 54}
            </h3>
          </div>
        </div>

        {/* Card 3: Global Rank (from LeetCode ranking) */}
        <div className="card-surface rounded-xl p-md neon-border top-border-highlight flex items-center gap-4 hover:border-tertiary-container/50 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center border border-outline-variant">
            <span className="material-symbols-outlined text-tertiary-container text-2xl">star_rate</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm mb-1 font-body-md">Global Rank</p>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold truncate max-w-[140px]">
              {user?.global_rank_num || user?.global_rank || 'Top 12%'}
            </h3>
          </div>
        </div>

        {/* Card 4: Avg Time / AC Rate */}
        <div className="card-surface rounded-xl p-md neon-border top-border-highlight flex items-center gap-4 hover:border-secondary-fixed/50 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center border border-outline-variant">
            <span className="material-symbols-outlined text-secondary-fixed text-2xl">timer</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm mb-1 font-body-md">Avg Time</p>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
              {user?.avg_time || '14m 20s'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Column (Left - 8 cols) */}
      <div className="col-span-1 md:col-span-12 lg:col-span-8 flex flex-col gap-lg">
        {/* Activity Heatmap (From LeetCode Submission Calendar) */}
        <section className="card-surface rounded-xl neon-border top-border-highlight p-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-lg text-on-surface font-bold">Activity Heatmap</h3>
                {user?.leetcode_username && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-code-sm">
                    LeetCode @{user.leetcode_username}
                  </span>
                )}
              </div>
              <p className="font-code-sm text-xs text-on-surface-variant mt-0.5">
                365-Day continuous submission matrix from LeetCode calendar
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant font-code-sm">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="heatmap-square level-0"></div>
                <div className="heatmap-square level-1"></div>
                <div className="heatmap-square level-2"></div>
                <div className="heatmap-square level-3"></div>
                <div className="heatmap-square level-4"></div>
              </div>
              <span>More</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2 relative">
            <div className="flex gap-1 min-w-max">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className={`heatmap-square level-${day.level || 0} cursor-pointer`}
                      onMouseEnter={() => setHoveredCell(day)}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Hover Tooltip */}
            {hoveredCell && (
              <div className="mt-3 p-2 rounded bg-surface-container border border-outline-variant inline-flex items-center gap-2 text-xs font-code-sm text-primary">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                <span>{hoveredCell.date || 'Activity Record'}: {hoveredCell.count || 0} solutions committed</span>
              </div>
            )}
          </div>
        </section>

        {/* The Vault (Data Table) */}
        <section className="card-surface rounded-xl neon-border top-border-highlight flex flex-col overflow-hidden">
          <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center">
            <div>
              <h3 className="font-headline-md text-lg text-on-surface font-bold">The Vault</h3>
              <p className="font-code-sm text-xs text-on-surface-variant">Active algorithms & complexity models</p>
            </div>
            <button
              onClick={() => setCurrentScreen('vault')}
              className="text-xs bg-transparent border border-outline-variant text-on-surface px-3 py-1.5 rounded hover:bg-surface-container-high hover:border-primary hover:text-primary transition-colors font-label-caps cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant text-xs font-label-caps bg-surface-container-lowest">
                  <th className="px-6 py-3 font-normal">Problem Name</th>
                  <th className="px-6 py-3 font-normal">Difficulty</th>
                  <th className="px-6 py-3 font-normal">Language</th>
                  <th className="px-6 py-3 font-normal">Complexity</th>
                  <th className="px-6 py-3 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentProblems.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setCurrentScreen('vault')}
                    className="border-b border-outline-variant/20 hover:bg-surface-container-high/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-code-sm text-on-surface font-medium">
                      {p.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-label-caps text-[10px] px-2 py-1 rounded border ${getDifficultyBadge(p.difficulty)}`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-code-sm text-xs text-on-surface-variant">
                      {p.language}
                    </td>
                    <td className="px-6 py-4 font-code-sm text-xs text-secondary">
                      {p.time_complexity || 'O(n)'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentScreen('vault');
                        }}
                        className="p-1.5 rounded border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-colors"
                        title="Inspect Code"
                      >
                        <span className="material-symbols-outlined text-sm">code</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Right Column (4 cols) */}
      <div className="col-span-1 md:col-span-12 lg:col-span-4 flex flex-col gap-lg">
        {/* AI Insight Panel */}
        <section className="card-surface rounded-xl neon-border top-border-highlight ai-panel-accent p-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-label-caps text-xs text-secondary tracking-wider uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                AI HEURISTICS
              </span>
              <span className="font-code-sm text-[10px] text-on-surface-variant">Active v2.4</span>
            </div>

            <h4 className="font-headline-md text-base text-on-surface font-bold mb-2">
              Sliding Window Opportunity
            </h4>
            <p className="font-code-sm text-xs text-on-surface-variant leading-relaxed mb-4">
              Detected nested O(N²) quadratic loops in <span className="text-primary font-bold">Substring Matcher</span>. Linearizing to O(N) reduces execution latency by 94.8%.
            </p>
          </div>

          <button
            onClick={() => setCurrentScreen('ai_insights')}
            className="w-full bg-[#1A1128] border border-secondary/50 text-secondary hover:bg-secondary hover:text-black font-label-caps text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
          >
            <span>ANALYZE IN AI CORE</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </section>

        {/* Weekly Target Progress Widget (Dynamic from LeetCode) */}
        <section className="card-surface rounded-xl neon-border top-border-highlight p-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-headline-md text-base text-on-surface font-bold">Weekly Goal</h4>
            <span className="font-code-sm text-xs text-primary font-bold">
              {weeklySolved} / {weeklyTotal} Solved
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-[#080808] rounded-full border border-outline-variant overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-primary via-primary-container to-[#6bfb9a] rounded-full shadow-neon-glow transition-all duration-500"
              style={{ width: `${Math.min(100, weeklyPct)}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-xs font-code-sm text-on-surface-variant">
            <span>{weeklyPct}% Completed</span>
            <span>{Math.max(0, weeklyTotal - weeklySolved)} problems remaining</span>
          </div>
        </section>

        {/* Quick Actions Panel */}
        <section className="card-surface rounded-xl neon-border top-border-highlight p-lg flex flex-col gap-3">
          <h4 className="font-headline-md text-sm text-on-surface font-bold uppercase tracking-wider font-label-caps">
            QUICK ACTIONS
          </h4>
          <button
            onClick={() => setIsLeetCodeModalOpen(true)}
            className="w-full py-2 px-3 rounded bg-surface-container border border-outline-variant hover:border-primary hover:text-primary text-xs font-code-sm text-on-surface flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400 text-sm">sync</span>
              Sync LeetCode Account
            </span>
            <span className="text-on-surface-variant">&gt;</span>
          </button>
          <button
            onClick={() => setIsSnippetModalOpen(true)}
            className="w-full py-2 px-3 rounded bg-surface-container border border-outline-variant hover:border-primary hover:text-primary text-xs font-code-sm text-on-surface flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">add_circle</span>
              New Code Snippet
            </span>
            <span className="text-on-surface-variant">&gt;</span>
          </button>
          <button
            onClick={() => setCurrentScreen('statistics')}
            className="w-full py-2 px-3 rounded bg-surface-container border border-outline-variant hover:border-primary hover:text-primary text-xs font-code-sm text-on-surface flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-sm">analytics</span>
              View Speed Distribution
            </span>
            <span className="text-on-surface-variant">&gt;</span>
          </button>
        </section>
      </div>
    </div>
  );
}
