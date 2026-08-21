import { store } from '../state/store.js';
import { ApiClient } from '../api/client.js';
import { API_ENDPOINTS } from '../api/endpoints.js';
import { Toast } from '../components/toast.js';

export class SettingsScreen {
  static init() {
    this.setupThemeSelector();
    this.setupApiTokenGenerator();
    this.setupDatabaseActions();

    store.subscribe('settings', (settings) => {
      if (!settings) return;
      this.populateSettingsForm(settings);
    });

    const form = document.getElementById('form-system-settings');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const theme = document.getElementById('setting-theme-select')?.value || 'cyberpunk';
        const font_family = document.getElementById('setting-font-select')?.value || 'JetBrains Mono';
        const ai_model = document.getElementById('setting-ai-model-select')?.value || 'AlgoVault-Neural-O3';
        const leetcode_auto_sync = document.getElementById('setting-autosync-toggle')?.checked ? 1 : 0;

        try {
          const updated = await ApiClient.put(API_ENDPOINTS.SETTINGS, {
            theme, font_family, ai_model, leetcode_auto_sync
          });
          store.setState({ settings: updated });
          document.documentElement.setAttribute('data-theme', theme);
          Toast.success('Settings saved successfully');
        } catch (err) {
          Toast.error(err.message);
        }
      });
    }
  }

  static setupThemeSelector() {
    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-theme', e.target.value);
      });
    }
  }

  static setupApiTokenGenerator() {
    const btnGenToken = document.getElementById('btn-generate-api-token');
    const tokenDisplay = document.getElementById('display-api-token');

    if (btnGenToken) {
      btnGenToken.addEventListener('click', async () => {
        try {
          const res = await ApiClient.post(API_ENDPOINTS.API_TOKEN);
          if (tokenDisplay) tokenDisplay.value = res.token;
          if (res.user) store.setState({ user: res.user });
          Toast.success('Generated new API Token');
        } catch (err) {
          Toast.error(err.message);
        }
      });
    }
  }

  static setupDatabaseActions() {
    // Export DB Backup JSON
    const btnExport = document.getElementById('btn-export-database');
    if (btnExport) {
      btnExport.addEventListener('click', async () => {
        try {
          const backup = await ApiClient.get(API_ENDPOINTS.DB_EXPORT);
          const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `algovault_backup_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          Toast.success('Database backup exported');
        } catch (err) {
          Toast.error('Export failed: ' + err.message);
        }
      });
    }

    // Factory Reset DB
    const btnReset = document.getElementById('btn-reset-database');
    if (btnReset) {
      btnReset.addEventListener('click', async () => {
        if (confirm('CAUTION: Are you sure you want to reset AlgoVault to factory defaults? All problems and stats will be reseeded.')) {
          try {
            await ApiClient.post(API_ENDPOINTS.DB_RESET);
            Toast.success('Database reset to defaults');
            // Reload all store data
            const user = await ApiClient.get(API_ENDPOINTS.USER);
            const stats = await ApiClient.get(API_ENDPOINTS.STATS);
            const problems = await ApiClient.get(API_ENDPOINTS.PROBLEMS);
            const settings = await ApiClient.get(API_ENDPOINTS.SETTINGS);
            store.setState({ user, stats, problems, settings });
          } catch (err) {
            Toast.error('Reset failed: ' + err.message);
          }
        }
      });
    }
  }

  static populateSettingsForm(settings) {
    const themeSelect = document.getElementById('setting-theme-select');
    const fontSelect = document.getElementById('setting-font-select');
    const aiSelect = document.getElementById('setting-ai-model-select');
    const autoSync = document.getElementById('setting-autosync-toggle');

    if (themeSelect && settings.theme) {
      themeSelect.value = settings.theme;
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
    if (fontSelect && settings.font_family) fontSelect.value = settings.font_family;
    if (aiSelect && settings.ai_model) aiSelect.value = settings.ai_model;
    if (autoSync) autoSync.checked = settings.leetcode_auto_sync === 1;
  }
}
