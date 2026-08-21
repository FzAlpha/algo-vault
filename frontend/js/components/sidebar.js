import { store } from '../state/store.js';

export class Sidebar {
  static init() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const screen = item.getAttribute('data-screen');
        if (screen) {
          store.setScreen(screen);
        }
      });
    });

    store.subscribe('currentScreen', (screen) => {
      navItems.forEach(item => {
        if (item.getAttribute('data-screen') === screen) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    });

    store.subscribe('user', (user) => {
      if (!user) return;
      const avatar = document.getElementById('sidebar-user-avatar');
      const handle = document.getElementById('sidebar-user-handle');
      const level = document.getElementById('sidebar-user-level');

      if (avatar && user.avatar_url) avatar.src = user.avatar_url;
      if (handle) handle.textContent = user.username || 'Operator';
      if (level) level.textContent = `LVL ${user.level || 99} • ${user.global_rank || 'Top 12%'}`;
    });

    const userProfileBtn = document.getElementById('sidebar-user-card');
    if (userProfileBtn) {
      userProfileBtn.addEventListener('click', () => {
        store.setScreen('profile');
      });
    }
  }
}
