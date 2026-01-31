
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Product } from '../types';

const Inventory: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('Todas as Categorias');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        const { data } = await supabase.from('products').select('category');
        if (data) {
            const uniqueCategories = Array.from(new Set(data.map(p => p.category)));
            setCategories(uniqueCategories);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let query = supabase.from('products').select('*').order('name');

            if (selectedCategory !== 'Todas as Categorias') {
                query = query.eq('category', selectedCategory);
            }

            const { data, error } = await query;
            if (error) throw error;
            setProducts(data || []);
        } catch (error: any) {
            console.error('Erro ao buscar estoque:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (qty: number, minStock: number) => {
        if (qty <= minStock) return 'critical';
        if (qty <= minStock + 10) return 'warning';
        return 'normal';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap justify-between items-end gap-4 px-1">
                <div>
                    <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Monitoramento de Estoque</h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Visão geral dos níveis de estoque e alertas de reposição</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-2 min-w-[240px]">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar por Categoria</label>
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
                    <div className="flex items-end flex-1 justify-end">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-red-500"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque Crítico</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-amber-500"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atenção (Próximo ao Mínimo)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabela de Estoque */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qtd em Estoque</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Estoque Mínimo</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-bold animate-pulse">
                                        Carregando estoque...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-bold">
                                        Nenhum item encontrado.
                                    </td>
                                </tr>
                            ) : products.map((product) => {
                                const status = getStockStatus(product.quantity, product.min_stock);
                                return (
                                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{product.name}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">SKU: {product.sku || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">{product.category}</td>
                                        <td className={`px-6 py-4 text-sm font-black text-right ${status === 'critical' ? 'text-red-600' : status === 'warning' ? 'text-amber-600' : 'text-slate-600 dark:text-slate-400'
                                            }`}>
                                            {product.quantity} <span className="text-[10px] opacity-60 font-medium">{product.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 font-bold text-right">{product.min_stock}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${status === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                                    status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                                                }`}>
                                                {status === 'critical' ? 'crítico' : status === 'warning' ? 'atenção' : 'normal'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
