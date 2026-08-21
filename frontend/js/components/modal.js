// Reusable Modal Controller

export class Modal {
  static open(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.add('open');
      const firstInput = el.querySelector('input:not([type="hidden"]), textarea, select');
      if (firstInput) setTimeout(() => firstInput.focus(), 50);
    }
  }

  static close(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.remove('open');
    }
  }

  static setupListeners() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('open');
        }
      });
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        Modal.close(modalId);
      });
    });
  }
}
