import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI states
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [isLeetCodeModalOpen, setIsLeetCodeModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [toasts, setToasts] = useState([]);

  // Add toast notification
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch initial data
  const refreshUser = async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Failed fetching user', err);
    }
  };

  const refreshProblems = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (selectedDifficulty && selectedDifficulty !== 'All' && selectedDifficulty !== 'Difficulty: All') {
        queryParams.append('difficulty', selectedDifficulty);
      }
      if (selectedLanguage && selectedLanguage !== 'All' && selectedLanguage !== 'Language: All') {
        queryParams.append('language', selectedLanguage);
      }
      if (sortBy) queryParams.append('sort', sortBy);

      const res = await fetch(`/api/problems?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProblems(data);
      }
    } catch (err) {
      console.error('Failed fetching problems', err);
    }
  };

  const refreshStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed fetching stats', err);
    }
  };

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed fetching settings', err);
    }
  };

  const refreshAiInsights = async () => {
    try {
      const res = await fetch('/api/ai/insights');
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
      }
    } catch (err) {
      console.error('Failed fetching AI insights', err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      refreshUser(),
      refreshProblems(),
      refreshStats(),
      refreshSettings(),
      refreshAiInsights()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    refreshProblems();
  }, [searchTerm, selectedDifficulty, selectedLanguage, sortBy]);

  // Actions
  const addProblem = async (problemData) => {
    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problemData)
      });
      if (res.ok) {
        addToast(`Problem "${problemData.name}" stored in Vault.`, 'success');
        await Promise.all([refreshProblems(), refreshStats(), refreshUser()]);
        return true;
      }
    } catch (err) {
      addToast('Failed to add snippet.', 'error');
    }
    return false;
  };

  const deleteProblem = async (id, name) => {
    try {
      const res = await fetch(`/api/problems/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(`Deleted "${name}" from Vault.`, 'info');
        await Promise.all([refreshProblems(), refreshStats(), refreshUser()]);
      }
    } catch (err) {
      addToast('Failed to delete problem.', 'error');
    }
  };

  const syncLeetCode = async (username) => {
    try {
      addToast(`Connecting to LeetCode profile @${username}...`, 'info');
      const res = await fetch('/api/auth/leetcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`LeetCode @${username} synchronized successfully!`, 'success');
        await Promise.all([refreshUser(), refreshStats()]);
        return data;
      } else {
        addToast(`Failed to sync LeetCode: ${data.error}`, 'error');
      }
    } catch (err) {
      addToast('Network error during LeetCode sync', 'error');
    }
    return null;
  };

  const loginManual = async (terminalId) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terminalId })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Operator session established: ${terminalId || 'Vault_Architect'}`, 'success');
        await refreshUser();
        setCurrentScreen('dashboard');
      }
    } catch (err) {
      addToast('Login execution failed', 'error');
    }
  };

  const updateUserSettings = async (updatedSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        addToast('Configuration applied and saved to SQLite.', 'success');
        await refreshSettings();
      }
    } catch (err) {
      addToast('Failed to save settings.', 'error');
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        addToast('Developer profile updated in SQLite.', 'success');
        await refreshUser();
      }
    } catch (err) {
      addToast('Failed to update profile.', 'error');
    }
  };

  const resetDatabase = async () => {
    try {
      const res = await fetch('/api/db/reset', { method: 'POST' });
      if (res.ok) {
        addToast('Database reset to factory seeds.', 'info');
        await refreshAll();
      }
    } catch (err) {
      addToast('Failed to reset database.', 'error');
    }
  };

  const value = {
    currentScreen,
    setCurrentScreen,
    user,
    problems,
    stats,
    settings,
    aiInsights,
    loading,
    isSnippetModalOpen,
    setIsSnippetModalOpen,
    isLeetCodeModalOpen,
    setIsLeetCodeModalOpen,
    searchTerm,
    setSearchTerm,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedLanguage,
    setSelectedLanguage,
    sortBy,
    setSortBy,
    toasts,
    addToast,
    addProblem,
    deleteProblem,
    syncLeetCode,
    loginManual,
    updateUserSettings,
    updateUserProfile,
    resetDatabase,
    refreshAll
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
