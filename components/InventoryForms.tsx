
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Product } from '../types';

const InventoryForms: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Entry Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [entryQty, setEntryQty] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryLot, setEntryLot] = useState('');
  const [isSubmittingEntry, setIsSubmittingEntry] = useState(false);

  // Exit Form State
  const [exitProductId, setExitProductId] = useState('');
  const [exitQty, setExitQty] = useState('');
  const [exitDestination, setExitDestination] = useState('Secretaria');
  const [exitResponsible, setExitResponsible] = useState('');
  const [isSubmittingExit, setIsSubmittingExit] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !entryQty) {
      alert('Por favor, selecione um produto e informe a quantidade.');
      return;
    }

    try {
      setIsSubmittingEntry(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('movements').insert([
        {
          product_id: selectedProductId,
          quantity: parseFloat(entryQty),
          type: 'in',
          description: `Entrada - Lote: ${entryLot || 'N/A'} - Data: ${entryDate}`,
          responsible_id: user?.id
        }
      ]);

      if (error) throw error;

      alert('Entrada registrada com sucesso!');

      // Clear form
      setSelectedProductId('');
      setEntryQty('');
      setEntryLot('');
    } catch (error: any) {
      alert('Erro ao registrar entrada: ' + error.message);
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitProductId || !exitQty) {
      alert('Por favor, selecione um produto e informe a quantidade.');
      return;
    }

    const selectedProduct = products.find(p => p.id === exitProductId);
    if (selectedProduct && parseFloat(exitQty) > selectedProduct.quantity) {
      alert(`Quantidade insuficiente em estoque. Disponível: ${selectedProduct.quantity} ${selectedProduct.unit}`);
      return;
    }

    try {
      setIsSubmittingExit(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('movements').insert([
        {
          product_id: exitProductId,
          quantity: parseFloat(exitQty),
          type: 'out',
          description: `Saída - Destino: ${exitDestination} - Responsável: ${exitResponsible}`,
          responsible_id: user?.id
        }
      ]);

      if (error) throw error;

      alert('Saída registrada com sucesso!');

      // Clear form
      setExitProductId('');
      setExitQty('');
      setExitResponsible('');

      // Refresh list
      fetchProducts();
    } catch (error: any) {
      alert('Erro ao registrar saída: ' + error.message);
    } finally {
      setIsSubmittingExit(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Formulário de Entrada */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-1">
            <div className="size-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined font-black">add_box</span>
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white text-xl font-black">Nova Entrada de Estoque</h2>
              <p className="text-slate-500 text-xs font-medium">Registrar chegada de novos suprimentos</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <form className="flex flex-col gap-6" onSubmit={handleEntrySubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Selecionar Produto</label>
                <select
                  className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                >
                  <option value="">Selecione um produto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
                {loadingProducts && <p className="text-[10px] text-slate-400 animate-pulse">Carregando catálogo...</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Categoria</label>
                  <input
                    className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-50 dark:text-slate-400 font-bold text-sm"
                    value={products.find(p => p.id === selectedProductId)?.category || '---'}
                    readOnly
                    placeholder="Auto-preenchido"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantidade</label>
                  <input
                    className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    placeholder="0"
                    type="number"
                    value={entryQty}
                    onChange={(e) => setEntryQty(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data de Recebimento</label>
                  <input
                    className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Número do Lote</label>
                  <input
                    className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    placeholder="L-2024-X"
                    type="text"
                    value={entryLot}
                    onChange={(e) => setEntryLot(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmittingEntry}
                  className="flex-1 bg-primary text-white font-black uppercase text-xs tracking-widest h-12 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">
                    {isSubmittingEntry ? 'sync' : 'check_circle'}
                  </span>
                  {isSubmittingEntry ? 'Processando...' : 'Confirmar Entrada'}
                </button>
                <button
                  className="px-6 border border-slate-200 dark:border-slate-800 dark:text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  type="reset"
                  onClick={() => {
                    setSelectedProductId('');
                    setEntryQty('');
                    setEntryLot('');
                  }}
                >
                  Limpar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Formulário de Saída */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-1">
            <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined font-black">outbox</span>
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white text-xl font-black">Distribuição (Saída)</h2>
              <p className="text-slate-500 text-xs font-medium">Registrar saída para uso institucional</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <form className="flex flex-col gap-6" onSubmit={handleExitSubmit}>
              <div className="flex flex-col gap-2 relative">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Selecionar Item</label>
                <select
                  className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                  value={exitProductId}
                  onChange={(e) => setExitProductId(e.target.value)}
                  required
                >
                  <option value="">Selecione para retirada...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} | Est: {p.quantity} {p.unit}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantidade</label>
                  <input
                    className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    placeholder="0"
                    type="number"
                    value={exitQty}
                    onChange={(e) => setExitQty(e.target.value)}
                    max={products.find(p => p.id === exitProductId)?.quantity}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Destino</label>
                  <select
                    className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    value={exitDestination}
                    onChange={(e) => setExitDestination(e.target.value)}
                  >
                    <option>Secretaria</option>
                    <option>Lab de Ciências A</option>
                    <option>Cozinha Principal</option>
                    <option>Biblioteca</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Responsável pela Retirada</label>
                <input
                  className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                  placeholder="Nome completo do recebedor"
                  type="text"
                  value={exitResponsible}
                  onChange={(e) => setExitResponsible(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmittingExit}
                  className="flex-1 bg-primary text-white font-black uppercase text-xs tracking-widest h-12 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">
                    {isSubmittingExit ? 'sync' : 'local_shipping'}
                  </span>
                  {isSubmittingExit ? 'Processando...' : 'Confirmar Distribuição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryForms;
