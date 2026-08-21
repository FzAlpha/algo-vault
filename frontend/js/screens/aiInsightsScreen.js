import { store } from '../state/store.js';
import { ApiClient } from '../api/client.js';
import { API_ENDPOINTS } from '../api/endpoints.js';
import { Toast } from '../components/toast.js';
import { CodeViewer } from '../components/codeViewer.js';

export class AiInsightsScreen {
  static init() {
    this.fetchInsights();

    const btnAnalyze = document.getElementById('btn-ai-analyze-custom');
    if (btnAnalyze) {
      btnAnalyze.addEventListener('click', async () => {
        const code = document.getElementById('ai-custom-code-input')?.value;
        if (!code) {
          Toast.error('Please paste code to analyze');
          return;
        }
        try {
          const res = await ApiClient.post(API_ENDPOINTS.AI_ANALYZE, { code, language: 'C++' });
          Toast.success(`Detected: ${res.detected_complexity}`);
          const resBox = document.getElementById('ai-custom-analysis-result');
          if (resBox) {
            resBox.innerHTML = `
              <div class="card" style="border-left: 4px solid var(--accent-purple); margin-top: 12px;">
                <div style="font-weight: 600; color: var(--accent-purple);">${res.detected_complexity}</div>
                <div style="color: var(--text-secondary); margin-top: 4px; font-size: 13px;">${res.recommendation}</div>
              </div>
            `;
          }
        } catch (err) {
          Toast.error(err.message);
        }
      });
    }
  }

  static async fetchInsights() {
    try {
      const data = await ApiClient.get(API_ENDPOINTS.AI_INSIGHTS);
      store.setState({ aiInsights: data });
      this.render(data);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    }
  }

  static render(data) {
    if (!data || !data.analysis) return;

    const analysis = data.analysis;

    // Header info
    const titleEl = document.getElementById('ai-analysis-title');
    const badgeEl = document.getElementById('ai-detected-complexity');
    const speedupEl = document.getElementById('ai-speedup-metric');

    if (titleEl) titleEl.textContent = analysis.title;
    if (badgeEl) badgeEl.textContent = analysis.detectedComplexity;
    if (speedupEl) speedupEl.textContent = analysis.speedup;

    // Code comparison
    const targetEl = document.getElementById('ai-target-code');
    const optEl = document.getElementById('ai-optimized-code');
    const noteEl = document.getElementById('ai-annotation-notes');

    if (targetEl) targetEl.innerHTML = CodeViewer.highlight(analysis.targetFunction, analysis.language);
    if (optEl) optEl.innerHTML = CodeViewer.highlight(analysis.optimizedFunction, analysis.language);
    if (noteEl) noteEl.textContent = analysis.annotatedCode;

    // Recommendations list
    const recList = document.getElementById('ai-recommendations-list');
    if (recList && data.recommendations) {
      recList.innerHTML = data.recommendations.map(rec => `
        <div class="card" style="border-left: 4px solid var(--accent-purple); margin-bottom: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="font-weight: 600; font-size: 14px; color: #ffffff;">${rec.title}</div>
            <span class="badge badge-${rec.difficulty.toLowerCase()}">${rec.difficulty}</span>
          </div>
          <div style="font-size: 12px; color: var(--accent-purple); font-weight: 500; margin-bottom: 4px;">
            Pattern: ${rec.pattern}
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
            ${rec.reason}
          </div>
        </div>
      `).join('');
    }
  }
}
