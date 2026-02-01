
import React, { useState, useEffect } from 'react';
import { View } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Entries from './components/Entries';
import Exits from './components/Exits';
import Reports from './components/Reports';
import Admin from './components/Admin';
import Inventory from './components/Inventory';
import Auth from './components/Auth';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'entries':
        return <Entries />;
      case 'exits':
        return <Exits />;
      case 'reports':
        return <Reports />;
      case 'admin':
        return <Admin />;
      case 'inventory':
        return <Inventory />;
      default:
        return <Dashboard />;
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <Sidebar
        currentView={currentView}
        setView={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentView={currentView}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          session={session}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
