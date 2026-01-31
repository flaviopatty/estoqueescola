
import React, { useEffect, useState } from 'react';
import { View } from '../types';
import { supabase } from '../supabase';
import { LogOut } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

interface HeaderProps {
  currentView: View;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session: Session | null;
}

const Header: React.FC<HeaderProps> = ({ currentView, isDarkMode, toggleDarkMode, session }) => {
  const [role, setRole] = useState<string>('Carregando...');

  const titles: Record<View, string> = {
    dashboard: 'Visão Geral do Estoque',
    products: 'Catálogo de Produtos',
    entries: 'Entrada de Materiais',
    exits: 'Saída e Distribuição',
    reports: 'Relatórios Detalhados',
    admin: 'Administração de Usuários',
    suppliers: 'Gestão de Fornecedores',
    inventory: 'Monitoramento de Estoque'
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (data && !error) {
          setRole(data.role);
        } else {
          setRole('Usuário');
        }
      }
    };

    fetchProfile();
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 transition-colors">
      <div className="flex items-center gap-8">
        <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">{titles[currentView]}</h2>
        <div className="hidden md:flex relative items-center">
          <span className="absolute left-3 text-slate-400 material-symbols-outlined text-lg">search</span>
          <input
            className="w-72 pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder:text-slate-500"
            placeholder="Buscar itens, produtos ou SKU..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Alternar tema"
        >
          <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>

        <button
          onClick={handleSignOut}
          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          title="Sair do sistema"
        >
          <LogOut className="h-5 w-5" />
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
              {session?.user?.email || 'Usuário'}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-400">{role}</p>
          </div>
          <div
            className="size-10 rounded-full bg-cover bg-center border-2 border-slate-200 dark:border-slate-700 shadow-sm"
            style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuA31dFLp44YATXiD0JYbzdP1Xx1NmLH_bo1xf4EKdcysLJPiKhSgevkdv1h1ffy2gSwlT3DRFh0FpcP1Gh1-UZlNjsy9GjoDgRysg08x0KNBtDbxTwakvMkE3gCTieNHnvat14MSf0qdEfjC0RmL3CxO5DYHArAn91mk2COAi0waqS3sQlHq5jiZIqdKY9rB8ApA_W77O9Er43uu5b0kDc_FNUNtx1rdRKWbf_Z34Z0icBYWrZVNRkj8ieFwTm8Mt9Y7aNBhXxhGlU")` }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
