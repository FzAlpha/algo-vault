import React from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import NewSnippetModal from './components/NewSnippetModal';
import LeetCodeModal from './components/LeetCodeModal';
import Toast from './components/Toast';

import DashboardScreen from './screens/DashboardScreen';
import VaultScreen from './screens/VaultScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import AiInsightsScreen from './screens/AiInsightsScreen';
import SignInScreen from './screens/SignInScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  const { currentScreen, loading } = useApp();

  // If loading initially
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-primary flex flex-col items-center justify-center font-code-sm">
        <span className="material-symbols-outlined text-4xl animate-spin mb-4">terminal</span>
        <div className="text-sm font-bold tracking-widest uppercase">INITIALIZING ALGO-VAULT TERMINAL...</div>
        <div className="text-xs text-on-surface-variant mt-1">Connecting to local SQLite database & telemetry</div>
      </div>
    );
  }

  // If on Sign In screen, render full-screen terminal window
  if (currentScreen === 'signin') {
    return (
      <>
        <SignInScreen />
        <LeetCodeModal />
        <Toast />
      </>
    );
  }

  // Get current header title and breadcrumb path
  let headerTitle = 'Dashboard';
  let headerPath = '~/vault/dashboard';

  switch (currentScreen) {
    case 'vault':
      headerTitle = 'The Vault';
      headerPath = '~/vault/repository';
      break;
    case 'statistics':
      headerTitle = 'Statistics';
      headerPath = '~/vault/analytics';
      break;
    case 'ai_insights':
      headerTitle = 'AI Insights';
      headerPath = '~/vault/heuristics';
      break;
    case 'profile':
      headerTitle = 'Developer Profile';
      headerPath = '~/vault/operator';
      break;
    case 'settings':
      headerTitle = 'Settings';
      headerPath = '~/vault/settings';
      break;
    default:
      headerTitle = 'Dashboard';
      headerPath = '~/vault/dashboard';
  }

  return (
    <div className="min-h-screen bg-black text-on-surface font-sans flex flex-col md:flex-row antialiased">
      {/* Side Navigation Bar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top App Bar */}
        <TopHeader title={headerTitle} path={headerPath} />

        {/* Dynamic Screen View */}
        <main className="flex-1 pt-16 min-h-screen bg-black">
          {currentScreen === 'dashboard' && <DashboardScreen />}
          {currentScreen === 'vault' && <VaultScreen />}
          {currentScreen === 'statistics' && <StatisticsScreen />}
          {currentScreen === 'ai_insights' && <AiInsightsScreen />}
          {currentScreen === 'profile' && <ProfileScreen />}
          {currentScreen === 'settings' && <SettingsScreen />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <NewSnippetModal />
      <LeetCodeModal />
      <Toast />
    </div>
  );
}
