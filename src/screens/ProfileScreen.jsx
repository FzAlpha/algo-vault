import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ProfileScreen() {
  const { user, updateUserProfile, addToast, setCurrentScreen, setIsLeetCodeModalOpen } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || 'Vault_Architect',
    full_name: user?.full_name || 'Alex Mercer',
    email: user?.email || 'sysadmin@algo-vault.net',
    title: user?.title || 'Senior Optimizer // O(1) Specialist',
    bio: user?.bio || 'Full-stack engineer specializing in O(1) solutions and high-concurrency systems. Currently refactoring the world.'
  });

  const handleSave = async (e) => {
    e.preventDefault();
    await updateUserProfile(formData);
    setIsEditing(false);
  };

  const badges = [
    { name: 'O(1) Purist', icon: 'bolt', desc: 'Achieved sub-millisecond execution on 20+ problems', color: 'text-primary' },
    { name: 'Sliding Master', icon: 'auto_awesome', desc: 'Solved 15 consecutive window problems', color: 'text-secondary' },
    { name: 'Streak Legend', icon: 'local_fire_department', desc: 'Maintained 25+ days uninterrupted practice', color: 'text-tertiary-container' },
    { name: 'Heap Champion', icon: 'military_tech', desc: 'Optimal priority queue submissions', color: 'text-primary' },
  ];

  return (
    <div className="p-md md:p-lg max-w-[1440px] mx-auto w-full screen-enter space-y-lg">
      {/* Hero & Bio Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter bg-[#121212] p-lg rounded-xl border border-outline-variant border-t-primary relative">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-4 right-4 px-3 py-1.5 rounded bg-surface-container border border-outline-variant hover:border-primary text-xs font-label-caps text-on-surface hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">{isEditing ? 'close' : 'edit'}</span>
          <span>{isEditing ? 'CANCEL' : 'EDIT PROFILE'}</span>
        </button>

        {/* Avatar */}
        <div className="md:col-span-3 flex flex-col items-center justify-center gap-md border-b md:border-b-0 md:border-r border-outline-variant pb-md md:pb-0 md:pr-md">
          <div className="relative">
            <img
              src={user?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-bZztR6p2vQsH9f-e1uOkaxYljNvtwGQe6J1Kjbyf-OAgAzCBkP7uKSynszR847bpDFLzM6Qr4_QKrWtZ4liphs5VQ38vm_B3hHPb9sbF_yYbNisTVlWCIpL5mYNXDCmX-ym5lYcAYIZZWTORGEIJY0fpfSOtkoE9FoXyhVbIpK0k5Hdd53dVIrHm0kajofj6RgotlsEsMgWBLH_EvCNQpa3GwInmTWjde3v--wHZA6LbdQLuFXfd'}
              alt="Developer Avatar"
              className="w-32 h-32 md:w-36 md:h-36 rounded-full border-2 border-primary object-cover p-1 bg-surface-container shadow-neon-glow"
            />
            <div className="absolute -bottom-2 -right-2 bg-surface-container-highest px-2 py-0.5 rounded-md border border-primary font-code-sm text-xs text-primary flex items-center gap-1 glow-primary">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              Lvl {user?.level || 99}
            </div>
          </div>
        </div>

        {/* Bio info */}
        <div className="md:col-span-9 flex flex-col justify-center gap-md pl-0 md:pl-md">
          {!isEditing ? (
            <>
              <div>
                <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface flex items-center gap-2 font-bold">
                  {user?.username || 'Vault_Architect'}
                  <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                </h1>
                <p className="font-code-sm text-xs md:text-sm text-primary mt-1 font-semibold">
                  {user?.title || 'Senior Optimizer // O(1) Specialist'}
                </p>
              </div>

              <div className="bg-[#080808] p-3 rounded-lg border border-outline-variant font-code-sm text-xs text-on-surface-variant relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
                <span className="text-primary font-bold">&gt;_</span> {user?.bio || 'Full-stack engineer specializing in O(1) solutions and high-concurrency systems. Currently refactoring the world.'}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-primary/10 border border-primary text-primary font-code-sm text-xs rounded-md flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-sm">code</span> Python
                </span>
                <span className="px-2.5 py-1 bg-tertiary-container/10 border border-tertiary-container text-tertiary-container font-code-sm text-xs rounded-md flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-sm">settings_applications</span> Rust
                </span>
                <span className="px-2.5 py-1 bg-secondary-container/20 border border-secondary text-secondary font-code-sm text-xs rounded-md flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-sm">memory</span> Go
                </span>
                <span className="px-2.5 py-1 bg-on-surface-variant/10 border border-on-surface-variant text-on-surface font-code-sm text-xs rounded-md flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-sm">terminal</span> C++
                </span>
              </div>
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-3 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-label-caps text-on-surface-variant uppercase block mb-1">Handle</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-[#080808] border border-outline-variant rounded p-2 text-xs font-code-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-label-caps text-on-surface-variant uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-[#080808] border border-outline-variant rounded p-2 text-xs font-code-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-label-caps text-on-surface-variant uppercase block mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#080808] border border-outline-variant rounded p-2 text-xs font-code-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-label-caps text-on-surface-variant uppercase block mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-[#080808] border border-outline-variant rounded p-2 text-xs font-code-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded border border-outline-variant text-xs font-label-caps text-on-surface-variant hover:text-on-surface"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-primary-container text-black font-label-caps text-xs font-bold hover:bg-primary shadow-neon-glow"
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Stats Snapshot */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <div className="bg-[#121212] p-md rounded-xl border border-outline-variant flex items-center gap-md hover:border-primary transition-colors group">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">task_alt</span>
          </div>
          <div>
            <div className="font-label-caps text-xs text-on-surface-variant uppercase">Problems Solved</div>
            <div className="font-headline-md text-xl md:text-2xl text-on-surface font-bold">
              {user?.problems_solved || 54}
            </div>
          </div>
        </div>

        <div className="bg-[#121212] p-md rounded-xl border border-outline-variant flex items-center gap-md hover:border-tertiary-container transition-colors group">
          <div className="w-12 h-12 bg-tertiary-container/10 rounded-lg flex items-center justify-center text-tertiary-container group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">trophy</span>
          </div>
          <div>
            <div className="font-label-caps text-xs text-on-surface-variant uppercase">Global Rank</div>
            <div className="font-headline-md text-xl md:text-2xl text-tertiary-container font-bold">
              {user?.global_rank_num || '#42'}
            </div>
          </div>
        </div>

        <div className="bg-[#121212] p-md rounded-xl border border-outline-variant flex items-center gap-md hover:border-secondary transition-colors group">
          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">commit</span>
          </div>
          <div>
            <div className="font-label-caps text-xs text-on-surface-variant uppercase">LeetCode Handle</div>
            <div 
              onClick={() => setIsLeetCodeModalOpen(true)}
              className="font-headline-md text-base md:text-lg text-secondary font-bold cursor-pointer hover:underline truncate"
            >
              @{user?.leetcode_username || 'vault_architect'}
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Showcase */}
      <section className="bg-[#121212] p-lg rounded-xl border border-outline-variant">
        <h3 className="font-label-caps text-xs text-on-surface uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">military_tech</span>
          ACQUIRED BADGES & HONORS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {badges.map((b, i) => (
            <div
              key={i}
              className="p-4 bg-[#080808] rounded-lg border border-outline-variant hover:border-primary/50 transition-all flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-xl ${b.color}`}>
                  {b.icon}
                </span>
                <span className="font-headline-md text-sm text-on-surface font-bold">{b.name}</span>
              </div>
              <p className="font-code-sm text-[11px] text-on-surface-variant leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
