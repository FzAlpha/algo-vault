import { store } from '../state/store.js';
import { ApiClient } from '../api/client.js';
import { API_ENDPOINTS } from '../api/endpoints.js';
import { Toast } from '../components/toast.js';

export class SignInScreen {
  static init() {
    const input = document.getElementById('terminal-command-input');
    const log = document.getElementById('terminal-output-log');

    if (!input || !log) return;

    this.appendOutput(log, `ALGOVAULT C++ CORE v2.4 - OPERATOR ACCESS TERMINAL\nType 'help' for available CLI commands.\n`);

    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        input.value = '';
        if (!cmd) return;

        this.appendOutput(log, `> ${cmd}`);
        await this.handleCommand(cmd, log);
      }
    });
  }

  static appendOutput(logEl, text) {
    const line = document.createElement('div');
    line.style.whiteSpace = 'pre-wrap';
    line.style.marginBottom = '6px';
    line.textContent = text;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  static async handleCommand(cmd, logEl) {
    const parts = cmd.split(' ');
    const action = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    switch (action) {
      case 'help':
        this.appendOutput(logEl, `Available Commands:
  auth <name>          - Authenticate as terminal operator
  login <name>         - Alias for auth
  sync <username>      - Sync profile and submissions from LeetCode
  status               - Check C++ backend engine status
  whoami               - Print current operator identity
  clear                - Clear terminal log screen
  vault                - Navigate directly to The Vault
  stats                - Navigate to statistics view`);
        break;

      case 'auth':
      case 'login': {
        const operatorName = arg || 'Operator';
        this.appendOutput(logEl, `[AUTH] Connecting to C++ Crypto Engine for operator: ${operatorName}...`);
        try {
          const res = await ApiClient.post(API_ENDPOINTS.LOGIN, { terminalId: operatorName });
          if (res.token) {
            ApiClient.setAuthToken(res.token);
          }
          if (res.user) {
            store.setState({ user: res.user });
          }
          this.appendOutput(logEl, `[OK] ${res.message}\nSession token issued.`);
          Toast.success(`Welcome back, ${operatorName}`);
        } catch (err) {
          this.appendOutput(logEl, `[ERROR] ${err.message}`);
        }
        break;
      }

      case 'sync': {
        if (!arg) {
          this.appendOutput(logEl, `[ERROR] Usage: sync <leetcode_username>`);
          return;
        }
        this.appendOutput(logEl, `[SYNC] Querying LeetCode GraphQL API for @${arg}...`);
        try {
          const res = await ApiClient.post(API_ENDPOINTS.LEETCODE_SYNC, { username: arg });
          this.appendOutput(logEl, `[OK] ${res.message}`);
          if (res.user) store.setState({ user: res.user });
          const stats = await ApiClient.get(API_ENDPOINTS.STATS);
          store.setState({ stats });
          Toast.success(`LeetCode @${arg} synced successfully!`);
        } catch (err) {
          this.appendOutput(logEl, `[ERROR] Sync failed: ${err.message}`);
        }
        break;
      }

      case 'status': {
        try {
          const health = await ApiClient.get(API_ENDPOINTS.HEALTH);
          this.appendOutput(logEl, `[STATUS] Engine: ${health.engine}\nRuntime: ${health.runtime}\nState: ${health.status}`);
        } catch (err) {
          this.appendOutput(logEl, `[ERROR] Backend unreachable: ${err.message}`);
        }
        break;
      }

      case 'whoami': {
        const user = store.getState().user;
        this.appendOutput(logEl, `Operator: ${user?.username || 'Guest'} (${user?.email || 'unauthenticated'})\nRank: ${user?.global_rank_num || '#--'}`);
        break;
      }

      case 'clear':
        logEl.innerHTML = '';
        break;

      case 'vault':
        store.setScreen('vault');
        break;

      case 'stats':
        store.setScreen('statistics');
        break;

      default:
        this.appendOutput(logEl, `[ERR] Command not recognized: '${cmd}'. Type 'help' for commands.`);
    }
  }
}
