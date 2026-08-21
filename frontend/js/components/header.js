import { store } from '../state/store.js';
import { Modal } from './modal.js';

export class Header {
  static init() {
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const currentFilters = store.getState().filters;
        store.setState({ filters: { ...currentFilters, search: val } });
        if (store.getState().currentScreen !== 'vault') {
          store.setScreen('vault');
        }
      });
    }

    const btnNewSnippet = document.getElementById('btn-new-snippet');
    if (btnNewSnippet) {
      btnNewSnippet.addEventListener('click', () => {
        Modal.open('modal-new-snippet');
      });
    }

    const btnLeetcodeSync = document.getElementById('btn-leetcode-sync');
    if (btnLeetcodeSync) {
      btnLeetcodeSync.addEventListener('click', () => {
        Modal.open('modal-leetcode-sync');
      });
    }

    const btnHeaderProfile = document.getElementById('btn-header-profile');
    if (btnHeaderProfile) {
      btnHeaderProfile.addEventListener('click', () => {
        store.setScreen('profile');
      });
    }

    const screenTitles = {
      dashboard: 'System Overview & Activity',
      vault: 'The Vault (Algorithm Repository)',
      statistics: 'Performance Analytics & Breakdown',
      aiInsights: 'AI Complexity & Optimization Engine',
      signIn: 'Terminal Operator Authentication',
      profile: 'Developer Identity & Ranking',
      settings: 'System Configuration & Data Management'
    };

    store.subscribe('currentScreen', (screen) => {
      const headerTitle = document.getElementById('header-title-text');
      if (headerTitle) {
        headerTitle.textContent = screenTitles[screen] || 'AlgoVault';
      }
      if (btnHeaderProfile) {
        if (screen === 'profile') {
          btnHeaderProfile.classList.add('active');
        } else {
          btnHeaderProfile.classList.remove('active');
        }
      }
    });

    store.subscribe('user', (user) => {
      if (!user) return;
      const avatar = document.getElementById('header-user-avatar');
      if (avatar && user.avatar_url) {
        avatar.src = user.avatar_url;
      }
    });
  }
}
