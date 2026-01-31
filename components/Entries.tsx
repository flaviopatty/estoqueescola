
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Product } from '../types';

const Entries: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [lotNumber, setLotNumber] = useState('');
  const [source, setSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity) {
      alert('Por favor, selecione um produto e informe a quantidade.');
      return;
    }

    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('movements').insert([
        {
          product_id: selectedProductId,
          quantity: parseFloat(quantity),
          type: 'in',
          description: `Entrada - Lote/NF: ${lotNumber || 'N/A'} - Origem: ${source || 'N/A'} - Data: ${entryDate}`,
          responsible_id: user?.id
        }
      ]);

      if (error) throw error;

      alert('Entrada de estoque registrada com sucesso!');

      // Clear form
      setSelectedProductId('');
      setQuantity('');
      setLotNumber('');
      setSource('');
    } catch (error: any) {
      alert('Erro ao registrar entrada: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 px-1">
        <div className="size-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-200 dark:border-emerald-800">
          <span className="material-symbols-outlined text-3xl font-black">add_box</span>
        </div>
        <div>
          <h2 className="text-slate-900 dark:text-white text-2xl font-black">Nova Entrada de Estoque</h2>
          <p className="text-slate-500 text-sm font-medium">Selecione um produto do catálogo para registrar a chegada</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Selecionar Produto Cadastrado</label>
            <div className="relative">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                className="w-full h-14 px-5 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold appearance-none"
              >
                <option value="">-- Escolha um produto do catálogo --</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
            {loadingProducts && <p className="text-[10px] text-emerald-500 animate-pulse font-bold mt-1">Sincronizando catálogo...</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Categoria (Automático)</label>
            <input
              readOnly
              value={selectedProduct?.category || ''}
              className="w-full h-14 px-5 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold cursor-not-allowed"
              placeholder="Selecione um produto acima"
              type="text"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantidade Recebida</label>
            <input
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
              placeholder="0"
              type="number"
              min="0.01"
              step="0.01"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data de Recebimento</label>
            <input
              required
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
              type="date"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Número do Lote ou NF</label>
            <input
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
              placeholder="ex: NF-99281 / L-2024-X"
              type="text"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Fornecedor / Origem</label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
              placeholder="Nome da empresa ou departamento de origem"
              type="text"
            />
          </div>

          <div className="pt-6 md:col-span-2 flex gap-4">
            <button
              type="submit"
              disabled={!selectedProductId || isSubmitting}
              className={`flex-1 text-white font-black uppercase text-xs tracking-widest h-14 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${selectedProductId && !isSubmitting
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 active:scale-95'
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                }`}
            >
              <span className={`material-symbols-outlined ${isSubmitting ? 'animate-spin' : ''}`}>
                {isSubmitting ? 'sync' : 'save'}
              </span>
              {isSubmitting ? 'Registrando...' : 'Confirmar Entrada de Estoque'}
            </button>
            <button
              onClick={() => {
                setSelectedProductId('');
                setQuantity('');
                setLotNumber('');
                setSource('');
              }}
              className="px-10 border border-slate-200 dark:border-slate-800 dark:text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              type="reset"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Entries;
