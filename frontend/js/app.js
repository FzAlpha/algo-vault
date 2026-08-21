import { store } from './state/store.js';
import { ApiClient } from './api/client.js';
import { API_ENDPOINTS } from './api/endpoints.js';
import { Toast } from './components/toast.js';
import { Modal } from './components/modal.js';
import { Sidebar } from './components/sidebar.js';
import { Header } from './components/header.js';

import { DashboardScreen } from './screens/dashboardScreen.js';
import { VaultScreen } from './screens/vaultScreen.js';
import { StatisticsScreen } from './screens/statisticsScreen.js';
import { AiInsightsScreen } from './screens/aiInsightsScreen.js';
import { SignInScreen } from './screens/signInScreen.js';
import { ProfileScreen } from './screens/profileScreen.js';
import { SettingsScreen } from './screens/settingsScreen.js';

class App {
  static async init() {
    console.log('⚡ Initializing AlgoVault Web Application with C++ Backend...');

    // Setup Modals & Components
    Modal.setupListeners();
    Sidebar.init();
    Header.init();

    // Initialize Screens
    DashboardScreen.init();
    VaultScreen.init();
    StatisticsScreen.init();
    AiInsightsScreen.init();
    SignInScreen.init();
    ProfileScreen.init();
    SettingsScreen.init();

    this.setupScreenRouter();
    this.setupGlobalModals();

    // Load initial data from C++ Backend
    await this.loadInitialData();
  }

  static setupScreenRouter() {
    store.subscribe('currentScreen', (screen) => {
      document.querySelectorAll('.screen-container').forEach(container => {
        if (container.id === `screen-${screen}`) {
          container.classList.add('active');
        } else {
          container.classList.remove('active');
        }
      });
    });
  }

  static setupGlobalModals() {
    // LeetCode Sync Form
    const lcForm = document.getElementById('form-leetcode-sync');
    if (lcForm) {
      lcForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('leetcode-username-input')?.value;
        if (!username) return;

        Toast.info(`Connecting to LeetCode API for @${username}...`);
        try {
          const res = await ApiClient.post(API_ENDPOINTS.LEETCODE_SYNC, { username });
          if (res.user) store.setState({ user: res.user });
          
          const stats = await ApiClient.get(API_ENDPOINTS.STATS);
          const problems = await ApiClient.get(API_ENDPOINTS.PROBLEMS);
          store.setState({ stats, problems });

          Toast.success(`Synced @${username} (${res.leetcodeData?.problemsSolved || 0} solved)!`);
          Modal.close('modal-leetcode-sync');
          lcForm.reset();
        } catch (err) {
          Toast.error(err.message);
        }
      });
    }
  }

  static async loadInitialData() {
    try {
      const [user, stats, problems, settings] = await Promise.all([
        ApiClient.get(API_ENDPOINTS.USER),
        ApiClient.get(API_ENDPOINTS.STATS),
        ApiClient.get(API_ENDPOINTS.PROBLEMS),
        ApiClient.get(API_ENDPOINTS.SETTINGS)
      ]);

      store.setState({ user, stats, problems, settings });

      if (settings && settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme);
      }

      console.log('✅ AlgoVault initialized successfully with C++ backend.');
    } catch (err) {
      console.warn('Backend offline or initializing:', err);
      Toast.error('Could not connect to C++ backend. Make sure the server is running on port 3001.');
    }
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
