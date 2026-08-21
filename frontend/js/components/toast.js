// Toast Notification System

export class Toast {
  static getContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  static show(message, type = 'success', duration = 3500) {
    const container = this.getContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconName = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';

    toast.innerHTML = `
      <span class="material-symbols-outlined toast-icon">${iconName}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.25s ease forwards';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  static success(message) {
    this.show(message, 'success');
  }

  static error(message) {
    this.show(message, 'error', 4500);
  }

  static info(message) {
    this.show(message, 'info');
  }
}
