
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Painel Principal', icon: 'dashboard' },
    { id: 'inventory', label: 'Estoque', icon: 'box' },
    { id: 'products', label: 'Produtos', icon: 'inventory' },
    { id: 'entries', label: 'Entradas', icon: 'add_circle' },
    { id: 'exits', label: 'Saídas', icon: 'do_not_disturb_on' },
    { id: 'reports', label: 'Relatórios', icon: 'analytics' },
    { id: 'admin', label: 'Administração', icon: 'security' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-white text-base font-bold leading-none">EduEstoque</h1>
            <p className="text-slate-500 text-xs mt-1 font-medium">Portal Admin</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${currentView === item.id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400'
                }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${currentView === item.id ? 'fill-current' : ''}`}>
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setView('products')}
          className="w-full flex items-center justify-center gap-2 rounded-xl h-11 px-4 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">library_add</span>
          <span>Novo Produto</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
