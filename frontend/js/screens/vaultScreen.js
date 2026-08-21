import { store } from '../state/store.js';
import { ApiClient } from '../api/client.js';
import { API_ENDPOINTS } from '../api/endpoints.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { CodeViewer } from '../components/codeViewer.js';

export class VaultScreen {
  static init() {
    this.setupFilters();
    this.setupProblemActions();

    store.subscribe('problems', (problems) => {
      this.renderTable(problems);
    });

    store.subscribe('filters', () => {
      this.fetchFilteredProblems();
    });
  }

  static setupFilters() {
    // Difficulty chips
    const chips = document.querySelectorAll('.vault-filter-chips .filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const diff = chip.getAttribute('data-difficulty');
        const filters = store.getState().filters;
        store.setState({ filters: { ...filters, difficulty: diff } });
      });
    });

    // Language dropdown
    const langSelect = document.getElementById('vault-language-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        const filters = store.getState().filters;
        store.setState({ filters: { ...filters, language: e.target.value } });
      });
    }

    // Sort dropdown
    const sortSelect = document.getElementById('vault-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const filters = store.getState().filters;
        store.setState({ filters: { ...filters, sort: e.target.value } });
      });
    }
  }

  static async fetchFilteredProblems() {
    try {
      const filters = store.getState().filters;
      const problems = await ApiClient.get(API_ENDPOINTS.PROBLEMS, {
        search: filters.search,
        difficulty: filters.difficulty,
        language: filters.language,
        sort: filters.sort
      });
      store.setState({ problems });
    } catch (err) {
      Toast.error('Failed to load problems: ' + err.message);
    }
  }

  static renderTable(problems = []) {
    const tbody = document.getElementById('vault-problems-tbody');
    const emptyState = document.getElementById('vault-empty-state');
    if (!tbody) return;

    if (problems.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = problems.map(prob => `
      <tr data-problem-id="${prob.id}">
        <td style="width: 40px; text-align: center;">
          <span class="material-symbols-outlined favorite-star ${prob.is_favorite ? 'active' : ''}" data-fav-id="${prob.id}">
            ${prob.is_favorite ? 'star' : 'star_border'}
          </span>
        </td>
        <td>
          <div style="font-weight: 600; color: #ffffff;">${prob.name}</div>
          <div style="display: flex; gap: 6px; margin-top: 4px;">
            ${(prob.tags || '').split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')}
          </div>
        </td>
        <td>
          <span class="badge badge-${(prob.difficulty || 'Medium').toLowerCase()}">${prob.difficulty}</span>
        </td>
        <td>
          <span style="font-family: var(--font-mono); font-size: 12px; color: var(--accent-primary);">${prob.language}</span>
        </td>
        <td>
          <span class="badge" style="background-color: var(--bg-elevated); color: var(--text-code);">${prob.time_complexity || 'O(n)'}</span>
        </td>
        <td style="font-family: var(--font-mono); font-size: 12px;">${prob.runtime_ms}ms</td>
        <td style="text-align: right;">
          <button class="btn btn-ghost btn-icon" data-view-id="${prob.id}" title="Inspect Code">
            <span class="material-symbols-outlined">code</span>
          </button>
          <button class="btn btn-ghost btn-icon" data-delete-id="${prob.id}" title="Delete Problem" style="color: var(--accent-red);">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </td>
      </tr>
    `).join('');
  }

  static setupProblemActions() {
    const tbody = document.getElementById('vault-problems-tbody');
    if (!tbody) return;

    tbody.addEventListener('click', async (e) => {
      // Favorite toggle
      const star = e.target.closest('[data-fav-id]');
      if (star) {
        e.stopPropagation();
        const id = star.getAttribute('data-fav-id');
        const prob = store.getState().problems.find(p => p.id === id);
        if (prob) {
          const newFav = prob.is_favorite ? 0 : 1;
          await ApiClient.put(`${API_ENDPOINTS.PROBLEMS}/${id}`, { is_favorite: newFav });
          prob.is_favorite = newFav;
          this.renderTable(store.getState().problems);
          Toast.success(newFav ? 'Added to favorites' : 'Removed from favorites');
        }
        return;
      }

      // Delete problem
      const delBtn = e.target.closest('[data-delete-id]');
      if (delBtn) {
        e.stopPropagation();
        const id = delBtn.getAttribute('data-delete-id');
        if (confirm('Are you sure you want to delete this problem from The Vault?')) {
          await ApiClient.delete(`${API_ENDPOINTS.PROBLEMS}/${id}`);
          Toast.success('Problem removed from Vault');
          this.fetchFilteredProblems();
          // refresh stats
          const stats = await ApiClient.get(API_ENDPOINTS.STATS);
          store.setState({ stats, user: stats.user });
        }
        return;
      }

      // View problem inspector
      const row = e.target.closest('tr[data-problem-id]');
      if (row) {
        const id = row.getAttribute('data-problem-id');
        this.openProblemInspector(id);
      }
    });

    // Form submit for new snippet
    const newSnippetForm = document.getElementById('form-new-snippet');
    if (newSnippetForm) {
      newSnippetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('snippet-name').value;
        const difficulty = document.getElementById('snippet-difficulty').value;
        const language = document.getElementById('snippet-language').value;
        const time_complexity = document.getElementById('snippet-time-comp').value;
        const space_complexity = document.getElementById('snippet-space-comp').value;
        const runtime_ms = parseInt(document.getElementById('snippet-runtime').value, 10) || 10;
        const code = document.getElementById('snippet-code').value;
        const notes = document.getElementById('snippet-notes').value;
        const tags = document.getElementById('snippet-tags').value;

        try {
          await ApiClient.post(API_ENDPOINTS.PROBLEMS, {
            name, difficulty, language, time_complexity, space_complexity, runtime_ms, code, notes, tags
          });
          Toast.success(`Problem "${name}" saved to The Vault!`);
          Modal.close('modal-new-snippet');
          newSnippetForm.reset();
          this.fetchFilteredProblems();
          const stats = await ApiClient.get(API_ENDPOINTS.STATS);
          store.setState({ stats, user: stats.user });
        } catch (err) {
          Toast.error(err.message);
        }
      });
    }
  }

  static async openProblemInspector(id) {
    try {
      const prob = await ApiClient.get(`${API_ENDPOINTS.PROBLEMS}/${id}`);
      const title = document.getElementById('inspector-title');
      const badge = document.getElementById('inspector-badge');
      const lang = document.getElementById('inspector-language');
      const complexity = document.getElementById('inspector-complexity');
      const notes = document.getElementById('inspector-notes');
      const codeEl = document.getElementById('inspector-code-content');

      if (title) title.textContent = prob.name;
      if (badge) {
        badge.className = `badge badge-${(prob.difficulty || 'Medium').toLowerCase()}`;
        badge.textContent = prob.difficulty;
      }
      if (lang) lang.textContent = prob.language;
      if (complexity) complexity.textContent = `${prob.time_complexity} • ${prob.space_complexity}`;
      if (notes) notes.textContent = prob.notes || 'No algorithmic notes attached.';
      if (codeEl) codeEl.innerHTML = CodeViewer.highlight(prob.code, prob.language);

      Modal.open('modal-problem-inspector');
    } catch (err) {
      Toast.error('Failed to open inspector: ' + err.message);
    }
  }
}
