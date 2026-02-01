
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Product } from '../types';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('Unidade (un)');
  const [category, setCategory] = useState('Informática');
  const [minStock, setMinStock] = useState('0');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      alert('Erro ao buscar produtos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku);
    setUnit(product.unit);
    setCategory(product.category);
    setMinStock(product.min_stock.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setUnit('Unidade (un)');
    setCategory('Informática');
    setMinStock('0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) {
      alert('Por favor, preencha o nome e o SKU.');
      return;
    }

    try {
      setSubmitting(true);
      const productData = {
        name,
        sku,
        unit,
        category,
        min_stock: parseFloat(minStock) || 0,
        status: 'ativo'
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert('Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        alert('Produto cadastrado com sucesso!');
      }

      resetForm();
      fetchProducts();
    } catch (error: any) {
      alert('Erro ao processar produto: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (error: any) {
      alert('Erro ao excluir produto: ' + error.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Formulário de Cadastro */}
        <div className="xl:col-span-1 space-y-6">
          <div className="flex items-center gap-3 px-1">
            <div className={`size-12 rounded-2xl ${editingProduct ? 'bg-amber-500' : 'bg-primary'} text-white flex items-center justify-center shadow-lg transition-colors`}>
              <span className="material-symbols-outlined text-2xl font-black">
                {editingProduct ? 'edit_note' : 'library_add'}
              </span>
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white text-xl font-black">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <p className="text-slate-500 text-xs font-medium">
                {editingProduct ? `Editando: ${editingProduct.sku}` : 'Defina os itens do catálogo mestre'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Produto</label>
                <input
                  className="w-full h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                  placeholder="ex: Notebook Dell Latitude"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código SKU/EAN</label>
                  <input
                    className="w-full h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    placeholder="INF-001"
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade</label>
                  <select
                    className="w-full h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option>Unidade (un)</option>
                    <option>Caixa (cx)</option>
                    <option>Pacote (pct)</option>
                    <option>Galão (gl)</option>
                    <option>Quilo (kg)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</label>
                <select
                  className="w-full h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Informática</option>
                  <option>Papelaria</option>
                  <option>Limpeza</option>
                  <option>Alimentos</option>
                  <option>Esportes</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque Mínimo (Alerta)</label>
                <input
                  className="w-full h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                  placeholder="0"
                  type="number"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                />
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full ${editingProduct ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-primary/90'} text-white font-black uppercase text-xs tracking-widest h-12 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {submitting ? 'sync' : (editingProduct ? 'save' : 'check_circle')}
                  </span>
                  {submitting ? (editingProduct ? 'Salvando...' : 'Cadastrando...') : (editingProduct ? 'Salvar Alterações' : 'Cadastrar no Catálogo')}
                </button>
                <button
                  className="w-full border border-slate-200 dark:border-slate-800 dark:text-white font-black uppercase text-[10px] tracking-widest h-10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  type="button"
                  onClick={resetForm}
                >
                  {editingProduct ? 'Cancelar Edição' : 'Limpar'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-6 rounded-2xl flex gap-4">
            <span className="material-symbols-outlined text-amber-600 font-black">info</span>
            <div>
              <h4 className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">Regra de Negócio</h4>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Um produto deve estar cadastrado aqui antes que qualquer movimentação de entrada ou saída possa ser registrada.
              </p>
            </div>
          </div>
        </div>

        {/* Listagem de Produtos Registrados */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-2xl font-black">list_alt</span>
              </div>
              <div>
                <h2 className="text-slate-900 dark:text-white text-xl font-black">Catálogo Ativo</h2>
                <p className="text-slate-500 text-xs font-medium">Itens disponíveis para movimentação</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchProducts}
                className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:text-primary transition-all"
              >
                <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
              </button>
              <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:text-primary transition-all">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            {loading ? (
              <div className="flex-1 flex items-center justify-center p-20">
                <div className="flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-4xl text-slate-300 animate-spin">sync</span>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando Catálogo...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-20">
                <div className="flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-4xl text-slate-200">inventory_2</span>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhum produto cadastrado</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <div className="min-w-[800px] lg:min-w-0">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                      <tr>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código SKU</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Produto</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Unidade</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Estoque Mín.</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {products.map((product) => (
                        <tr key={product.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${editingProduct?.id === product.id ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                          <td className="px-6 py-4 text-xs font-black text-primary font-mono">{product.sku}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-200">{product.name}</td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-slate-500 font-bold">{product.unit}</td>
                          <td className="px-6 py-4 text-sm text-right font-black text-slate-900 dark:text-white">{product.min_stock}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEdit(product)}
                                className={`p-1.5 rounded-lg transition-all ${editingProduct?.id === product.id ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary'}`}
                                title="Editar produto"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                title="Excluir produto"
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
            )}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Total: {products.length} {products.length === 1 ? 'produto registrado' : 'produtos registrados'}
              </span>
              <button className="text-[10px] font-black text-primary uppercase hover:underline">Ver catálogo completo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
