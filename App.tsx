
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
import Suppliers from './components/Suppliers';
import Auth from './components/Auth';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isFetchingPermissions, setIsFetchingPermissions] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchPermissions(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchPermissions(session.user.id);
      else setUserPermissions([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPermissions = async (userId: string) => {
    try {
      setIsFetchingPermissions(true);
      // 1. Pegar o cargo do usuário no perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError || !profile) throw profileError;

      // 2. Se for Administrador e não tiver registro na tabela roles, dar permissão total
      if (profile.role === 'Administrador') {
        const fullPermissions = ['dashboard', 'products', 'entries', 'exits', 'reports', 'admin', 'suppliers', 'inventory'];
        setUserPermissions(fullPermissions);
        return;
      }

      // 3. Pegar as permissões do cargo na tabela roles
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('permissions')
        .eq('name', profile.role)
        .single();

      if (roleError) {
        console.warn('Permissões não encontradas para o cargo:', profile.role);
        setUserPermissions(['dashboard']); // Mínimo acesso
      } else {
        setUserPermissions(roleData.permissions || ['dashboard']);
      }
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      setUserPermissions(['dashboard']);
    } finally {
      setIsFetchingPermissions(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const renderContent = () => {
    // Se ainda está carregando permissões, mostra loading
    if (isFetchingPermissions) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Validando Acessos...</p>
          </div>
        </div>
      );
    }

    // Se o usuário não tem permissão para a view atual, redireciona para a primeira permitida ou dashboard
    if (userPermissions.length > 0 && !userPermissions.includes(currentView)) {
      const fallbackView = userPermissions[0] as View;
      setCurrentView(fallbackView);
      return null;
    }

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
      case 'suppliers':
        return <Suppliers />;
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
        permissions={userPermissions}
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
