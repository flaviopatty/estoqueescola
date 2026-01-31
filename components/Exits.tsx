
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Product } from '../types';

const Exits: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [destination, setDestination] = useState('Secretaria');
  const [responsible, setResponsible] = useState('');
  const [observation, setObservation] = useState('');
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

    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (selectedProduct && parseFloat(quantity) > selectedProduct.quantity) {
      alert(`Quantidade insuficiente em estoque. Disponível: ${selectedProduct.quantity} ${selectedProduct.unit}`);
      return;
    }

    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('movements').insert([
        {
          product_id: selectedProductId,
          quantity: parseFloat(quantity),
          type: 'out',
          description: `Saída - Destino: ${destination} - Responsável: ${responsible} - Obs: ${observation}`,
          responsible_id: user?.id
        }
      ]);

      if (error) throw error;

      alert('Saída de estoque registrada com sucesso!');

      // Clear form
      setSelectedProductId('');
      setQuantity('');
      setResponsible('');
      setObservation('');

      // Refresh products to show updated stock
      fetchProducts();
    } catch (error: any) {
      alert('Erro ao registrar saída: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 px-1">
        <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/20">
          <span className="material-symbols-outlined text-3xl font-black">outbox</span>
        </div>
        <div>
          <h2 className="text-slate-900 dark:text-white text-2xl font-black">Distribuição de Materiais</h2>
          <p className="text-slate-500 text-sm font-medium">Selecione um item do inventário para registrar a saída</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 md:col-span-2 relative">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Produto para Retirada</label>
            <div className="relative">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                className="w-full h-14 px-5 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold appearance-none"
              >
                <option value="">-- Escolha um item do estoque --</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} | Estoque: {product.quantity} {product.unit}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
            {loadingProducts && <p className="text-[10px] text-primary animate-pulse font-bold mt-1">Sincronizando estoque...</p>}

            {selectedProduct && (
              <div className="mt-3 flex justify-between items-center px-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-[10px] text-primary font-black uppercase bg-primary/10 px-2 py-0.5 rounded">
                  SKU: {selectedProduct.sku}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Unidade: {selectedProduct.unit}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantidade para Saída</label>
            <input
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold"
              placeholder="0"
              type="number"
              min="0.01"
              step="0.01"
              max={selectedProduct?.quantity}
            />
            {selectedProduct && (
              <p className="text-[10px] text-slate-400 mt-1">Máximo disponível: {selectedProduct.quantity} {selectedProduct.unit}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Departamento / Sala de Destino</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold appearance-none"
            >
              <option>Secretaria</option>
              <option>Lab de Ciências A</option>
              <option>Cozinha Principal</option>
              <option>Biblioteca</option>
              <option>Manutenção</option>
              <option>Coordenação</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome do Responsável pela Retirada</label>
            <input
              required
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold"
              placeholder="Nome completo do funcionário ou professor"
              type="text"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Observações (Opcional)</label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="w-full p-5 rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold min-h-[100px]"
              placeholder="Justificativa da retirada ou notas adicionais..."
            />
          </div>

          <div className="pt-6 md:col-span-2 flex gap-4">
            <button
              type="submit"
              disabled={!selectedProductId || isSubmitting}
              className={`flex-1 text-white font-black uppercase text-xs tracking-widest h-14 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${selectedProductId && !isSubmitting
                ? 'bg-primary hover:bg-primary/90 shadow-primary/20 active:scale-95'
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                }`}
            >
              <span className={`material-symbols-outlined ${isSubmitting ? 'animate-spin' : ''}`}>
                {isSubmitting ? 'sync' : 'local_shipping'}
              </span>
              {isSubmitting ? 'Processando...' : 'Confirmar Baixa e Distribuição'}
            </button>
            <button
              onClick={() => {
                setSelectedProductId('');
                setQuantity('');
                setResponsible('');
                setObservation('');
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

export default Exits;
