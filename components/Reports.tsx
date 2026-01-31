
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface MovementWithProduct {
  id: string;
  type: string;
  quantity: number;
  description: string;
  created_at: string;
  responsible_id: string;
  product_id: string;
  product: {
    name: string;
    unit: string;
    category: string;
    sku: string;
    quantity: number;
  };
}

const Reports: React.FC = () => {
  const [movements, setMovements] = useState<MovementWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas as Categorias');
  const [selectedType, setSelectedType] = useState('Todos');

  useEffect(() => {
    fetchMovements();
    fetchCategories();
  }, [selectedCategory, selectedType]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('products').select('category');
    if (data) {
      const uniqueCategories = Array.from(new Set(data.map(p => p.category)));
      setCategories(uniqueCategories);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('movements')
        .select(`
          *,
          product:products (
            name,
            unit,
            category,
            sku,
            quantity
          )
        `)
        .order('created_at', { ascending: false });

      if (selectedType === 'entrada') {
        query = query.eq('type', 'in');
      } else if (selectedType === 'saída') {
        query = query.eq('type', 'out');
      }

      if (selectedCategory !== 'Todas as Categorias') {
        // Since we can't filter directly on joined data easily with basic Supabase client 
        // without complex syntax, we fetch all and filter in memory for simplicity 
        // OR better yet, we can try to filter if we had a view. 
        // For now, let's just fetch all and filter client-side to keep it simple and fast to implement.
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data as MovementWithProduct[];
      if (selectedCategory !== 'Todas as Categorias') {
        filteredData = filteredData.filter(m => m.product?.category === selectedCategory);
      }

      setMovements(filteredData || []);
    } catch (error: any) {
      console.error('Erro ao buscar movimentações:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Informações do Cabeçalho */}
      <div className="flex flex-wrap justify-between items-end gap-4 px-1">
        <div>
          <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Relatórios de Movimentação</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Log detalhado de todas as alterações no estoque</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            Exportar PDF / Imprimir
          </button>
        </div>
      </div>

      {/* Seção de Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-lg font-black">filter_alt</span>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Filtrar Relatórios</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
            >
              <option>Todos</option>
              <option value="entrada">Entrada</option>
              <option value="saída">Saída</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
            >
              <option>Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchMovements}
              className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Atualizar Dados
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Movimentações */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Item</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhes / Descrição</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Mvto</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Saldo Atual</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-bold animate-pulse">
                    Carregando movimentações...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-bold">
                    Nenhuma movimentação encontrada.
                  </td>
                </tr>
              ) : movements.map((move) => (
                <tr key={move.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${move.type === 'in'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                      : 'bg-primary/10 text-primary dark:bg-primary/20'
                      }`}>
                      {move.type === 'in' ? 'entrada' : 'saída'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-200">
                    {move.product?.name || 'Item Excluído'}
                    {move.product?.sku && <span className="block text-[10px] text-slate-400 font-medium">SKU: {move.product.sku}</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{move.description}</td>
                  <td className={`px-6 py-4 text-sm font-black text-right ${move.type === 'in' ? 'text-emerald-600' : 'text-primary'}`}>
                    {move.type === 'in' ? '+' : '-'}{move.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-600 dark:text-slate-400 text-right">
                    {move.product?.quantity ?? '---'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{move.product?.unit}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-bold whitespace-nowrap">{formatDate(move.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sumário */}
        <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Total de {movements.length} registros encontrados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
