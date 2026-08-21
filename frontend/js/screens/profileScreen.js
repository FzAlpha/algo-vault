import { store } from '../state/store.js';
import { ApiClient } from '../api/client.js';
import { API_ENDPOINTS } from '../api/endpoints.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';

export class ProfileScreen {
  static init() {
    store.subscribe('user', (user) => {
      if (!user) return;
      this.render(user);
    });

    const btnEditProfile = document.getElementById('btn-open-edit-profile');
    if (btnEditProfile) {
      btnEditProfile.addEventListener('click', () => {
        const user = store.getState().user || {};
        const inUser = document.getElementById('edit-username');
        const inName = document.getElementById('edit-fullname');
        const inEmail = document.getElementById('edit-email');
        const inTitle = document.getElementById('edit-title');
        const inBio = document.getElementById('edit-bio');
        const inAvatar = document.getElementById('edit-avatar');

        if (inUser) inUser.value = user.username || '';
        if (inName) inName.value = user.full_name || '';
        if (inEmail) inEmail.value = user.email || '';
        if (inTitle) inTitle.value = user.title || '';
        if (inBio) inBio.value = user.bio || '';
        if (inAvatar) inAvatar.value = user.avatar_url || '';

        Modal.open('modal-edit-profile');
      });
    }

    const formEdit = document.getElementById('form-edit-profile');
    if (formEdit) {
      formEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('edit-username').value;
        const full_name = document.getElementById('edit-fullname').value;
        const email = document.getElementById('edit-email').value;
        const title = document.getElementById('edit-title').value;
        const bio = document.getElementById('edit-bio').value;
        const avatar_url = document.getElementById('edit-avatar').value;

        try {
          const updated = await ApiClient.put(API_ENDPOINTS.USER, {
            username, full_name, email, title, bio, avatar_url
          });
          store.setState({ user: updated });
          Toast.success('Profile updated successfully');
          Modal.close('modal-edit-profile');
        } catch (err) {
          Toast.error(err.message);
        }
      });
    }
  }

  static render(user) {
    const avatar = document.getElementById('profile-avatar-img');
    const name = document.getElementById('profile-full-name');
    const handle = document.getElementById('profile-username-handle');
    const title = document.getElementById('profile-title-text');
    const bio = document.getElementById('profile-bio-text');
    const rankNum = document.getElementById('profile-rank-num');
    const streak = document.getElementById('profile-streak-count');
    const solved = document.getElementById('profile-solved-count');

    if (avatar && user.avatar_url) avatar.src = user.avatar_url;
    if (name) name.textContent = user.full_name || 'Alex Vance';
    if (handle) handle.textContent = `@${user.username || 'CipherByte'}`;
    if (title) title.textContent = user.title || 'Senior Systems Architect';
    if (bio) bio.textContent = user.bio || 'Passionate about algorithmic design.';
    if (rankNum) rankNum.textContent = user.global_rank_num || '#42';
    const streakCount = user.streak_days !== undefined && user.streak_days !== null ? user.streak_days : 0;
    if (streak) streak.textContent = `${streakCount} ${streakCount === 1 ? 'Day' : 'Days'}`;
    if (solved) solved.textContent = user.problems_solved !== undefined ? user.problems_solved : 0;
  }
}
