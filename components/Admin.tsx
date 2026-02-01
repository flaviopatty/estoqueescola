
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const Admin: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*').order('name'),
        supabase.from('roles').select('*').order('name')
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setUsers(profilesRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;

    try {
      setIsSubmittingRole(true);
      const { error } = await supabase.from('roles').insert([
        {
          name: newRoleName,
          permissions: selectedPermissions,
          description: `Perfil personalizado com ${selectedPermissions.length} permissões`
        }
      ]);

      if (error) throw error;

      alert('Perfil de acesso criado com sucesso!');
      setNewRoleName('');
      setSelectedPermissions([]);
      fetchData();
    } catch (error: any) {
      alert('Erro ao criar perfil: ' + error.message);
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover o acesso de ${name}?`)) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert('Erro ao remover usuário: ' + error.message);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert('Erro ao atualizar cargo: ' + error.message);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const permissions = [
    { name: 'Painel', desc: 'Visualizar status geral do inventário e alertas.' },
    { id: 'inventory_p', name: 'Estoque', desc: 'Monitorar níveis, validades e status dos itens.' },
    { id: 'entry_p', name: 'Entradas', desc: 'Registrar novos itens e chegada de estoque.' },
    { id: 'exit_p', name: 'Saídas', desc: 'Processar retiradas e distribuição de itens.' },
    { name: 'Relatórios', desc: 'Gerar auditorias e exportar planilhas de dados.' },
    { name: 'Admin', desc: 'Gerenciar usuários, funções e config. do sistema.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap justify-between items-end gap-3 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-sm font-black">security</span>
            <span className="text-primary text-[10px] font-black uppercase tracking-widest">Painel Administrativo Seguro</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Permissões do Sistema</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Gerenciar controles de acesso institucional</p>
        </div>
        <button className="flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined mr-2 text-[18px]">person_add</span>
          Adicionar Membro da Equipe
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gestão de Usuários */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-slate-900 dark:text-white text-lg font-black">Gestão de Usuários</h2>
              <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                {users.length} Usuários no Total
              </span>
            </div>

            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-lg">search</span>
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                  placeholder="Filtrar por nome, e-mail ou cargo..."
                  type="text"
                />
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <div className="min-w-[700px] lg:min-w-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço de E-mail</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold animate-pulse">
                          Sincronizando com Supabase...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold">
                          Nenhum usuário encontrado.
                        </td>
                      </tr>
                    ) : users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`size-10 rounded-2xl flex items-center justify-center font-black text-[10px] ${user.role === 'Administrador' ? 'bg-primary/10 text-primary' :
                              user.role === 'Gestor de Estoque' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                              {getInitials(user.name || 'U')}
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{user.name || 'Sem Nome'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-slate-400">{user.email}</td>
                        <td className="px-8 py-5">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className={`bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[10px] font-black uppercase tracking-wider focus:ring-2 focus:ring-primary/20 ${user.role === 'Administrador' ? 'text-blue-700' :
                              user.role === 'Gestor de Estoque' ? 'text-emerald-700' :
                                'text-slate-700 dark:text-slate-400'
                              }`}
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                            {!roles.find(r => r.name === user.role) && (
                              <option value={user.role}>{user.role}</option>
                            )}
                          </select>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:text-red-500 transition-all"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Perfil de Acesso */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-slate-900 dark:text-white text-lg font-black">Criar Perfil de Acesso</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Defina permissões para novos cargos.</p>
              </div>

              <form className="p-8 flex flex-col gap-8" onSubmit={handleCreateRole}>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Perfil</label>
                  <input
                    className="w-full rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-bold placeholder-slate-400 transition-all"
                    placeholder="ex: Técnico de Lab"
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                    Permissões do Cargo
                    <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">Acesso Institucional</span>
                  </label>
                  <div className="space-y-5 mt-2">
                    {permissions.map((perm, i) => (
                      <label key={i} className="flex items-start group cursor-pointer">
                        <input
                          className="mt-1 rounded-lg text-primary focus:ring-4 focus:ring-primary/10 h-5 w-5 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 transition-all"
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, perm.name]);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== perm.name));
                            }
                          }}
                        />
                        <div className="ml-4">
                          <span className="text-sm font-black text-slate-900 dark:text-white block group-hover:text-primary transition-colors">{perm.name}</span>
                          <span className="text-[10px] font-medium text-slate-400 block mt-0.5 leading-relaxed">{perm.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    disabled={isSubmittingRole}
                    className="w-full flex h-14 items-center justify-center rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    type="submit"
                  >
                    {isSubmittingRole ? 'Criando...' : 'Criar Perfil'}
                  </button>
                  <button
                    className="w-full flex h-12 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    type="button"
                    onClick={() => {
                      setNewRoleName('');
                      setSelectedPermissions([]);
                    }}
                  >
                    Limpar Formulário
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex gap-4">
              <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined font-black">info</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-primary uppercase tracking-widest">Escalabilidade RBAC</h4>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Alterações nas permissões de um Perfil refletirão automaticamente para todos os usuários atribuídos àquele cargo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
