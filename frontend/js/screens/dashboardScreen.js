import { store } from '../state/store.js';
import { ChartRenderer } from '../components/charts.js';

export class DashboardScreen {
  static init() {
    store.subscribe('stats', (stats) => {
      if (!stats) return;
      this.render(stats);
    });
  }

  static render(stats) {
    const user = stats.user || {};

    // Metric values
    const mSolved = document.getElementById('metric-problems-solved');
    const mStreak = document.getElementById('metric-streak-days');
    const mRank = document.getElementById('metric-global-rank');
    const mRate = document.getElementById('metric-success-rate');

    if (mSolved) mSolved.textContent = stats.totalProblems || user.problems_solved || 0;
    if (mStreak) mStreak.textContent = `${user.streak_days !== undefined && user.streak_days !== null ? user.streak_days : 0}d`;
    if (mRank) mRank.textContent = user.global_rank || 'Top 12%';
    if (mRate) mRate.textContent = `${user.success_rate || 94.2}%`;

    // Render 365-day Activity Heatmap
    if (stats.heatmap && stats.heatmap.length > 0) {
      ChartRenderer.renderHeatmap('dashboard-heatmap-grid', stats.heatmap);
    }

    // Weekly Goal
    if (stats.weeklyGoal) {
      const gSolved = document.getElementById('goal-solved-count');
      const gTotal = document.getElementById('goal-total-count');
      const gBar = document.getElementById('goal-progress-bar');
      if (gSolved) gSolved.textContent = stats.weeklyGoal.solved;
      if (gTotal) gTotal.textContent = stats.weeklyGoal.total;
      if (gBar) gBar.style.width = `${stats.weeklyGoal.percentage}%`;
    }

    // Recent Submissions List
    const subList = document.getElementById('dashboard-recent-submissions');
    if (subList && stats.recentSubmissions) {
      subList.innerHTML = stats.recentSubmissions.map(sub => `
        <div class="card" style="padding: 12px 16px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="status-dot"></span>
            <div>
              <div style="font-weight: 600; font-size: 13px;">${sub.title}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${sub.language} • ${sub.runtime_ms}ms • ${sub.submitted_at}</div>
            </div>
          </div>
          <span class="badge badge-${(sub.difficulty || 'Medium').toLowerCase()}">${sub.difficulty}</span>
        </div>
      `).join('');
    }
  }
}
