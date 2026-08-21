import { store } from '../state/store.js';
import { ChartRenderer } from '../components/charts.js';

export class StatisticsScreen {
  static init() {
    store.subscribe('stats', (stats) => {
      if (!stats) return;
      this.render(stats);
    });

    store.subscribe('currentScreen', (screen) => {
      if (screen === 'statistics') {
        const stats = store.getState().stats;
        if (stats) {
          setTimeout(() => this.render(stats), 50);
        }
      }
    });
  }

  static render(stats) {
    const user = stats.user || {};

    // Speedometer
    const percentile = user.avg_runtime_percentile !== undefined ? user.avg_runtime_percentile : 88;
    ChartRenderer.renderSpeedometer('canvas-speedometer', percentile);

    // Language Donut Chart & Legend
    if (stats.languageDistribution) {
      ChartRenderer.renderLanguageDonut('canvas-lang-donut', stats.languageDistribution);
      
      const langColors = {
        'C++': '#4ade80',
        'C': '#22d3ee',
        'Python': '#38bdf8',
        'Python3': '#38bdf8',
        'Java': '#fbbf24',
        'Rust': '#f87171',
        'TypeScript': '#a855f7',
        'JavaScript': '#eab308',
        'Go': '#06b6d4',
        'Kotlin': '#ec4899',
        'Bash': '#a3e635',
        'Swift': '#f97316',
        'Ruby': '#e11d48',
        'PHP': '#818cf8',
        'SQL': '#2dd4bf'
      };

      const legend = document.getElementById('stats-lang-legend');
      if (legend) {
        const entries = Object.entries(stats.languageDistribution).sort((a, b) => b[1] - a[1]);
        const total = entries.reduce((a, b) => a + b[1], 0) || 1;
        legend.innerHTML = entries.map(([lang, count]) => `
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${langColors[lang] || '#9ca3af'};"></span>
              ${lang}
            </span>
            <span style="font-family: var(--font-mono); color: #ffffff;">${count} (${Math.round((count / total) * 100)}%)</span>
          </div>
        `).join('');
      }
    }

    // Difficulty Breakdown Bars
    if (stats.difficultyBreakdown) {
      const { Easy = 0, Medium = 0, Hard = 0 } = stats.difficultyBreakdown;
      const total = Easy + Medium + Hard || 1;

      const barEasy = document.getElementById('stat-bar-easy');
      const barMedium = document.getElementById('stat-bar-medium');
      const barHard = document.getElementById('stat-bar-hard');

      const cntEasy = document.getElementById('stat-count-easy');
      const cntMedium = document.getElementById('stat-count-medium');
      const cntHard = document.getElementById('stat-count-hard');

      if (barEasy) barEasy.style.width = `${Math.min(100, Math.round((Easy / total) * 100))}%`;
      if (barMedium) barMedium.style.width = `${Math.min(100, Math.round((Medium / total) * 100))}%`;
      if (barHard) barHard.style.width = `${Math.min(100, Math.round((Hard / total) * 100))}%`;

      if (cntEasy) cntEasy.textContent = `${Easy} solved`;
      if (cntMedium) cntMedium.textContent = `${Medium} solved`;
      if (cntHard) cntHard.textContent = `${Hard} solved`;
    }

    // Time & Metrics
    const avgTime = document.getElementById('stat-avg-solve-time');
    const totalTime = document.getElementById('stat-total-solve-time');
    const efficiency = document.getElementById('stat-efficiency-score');

    if (avgTime) avgTime.textContent = user.avg_time || '14m 20s';
    if (totalTime) totalTime.textContent = user.total_time || '142h 32m';
    if (efficiency) efficiency.textContent = `${user.code_efficiency || 92}/100`;
  }
}
