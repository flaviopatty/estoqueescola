
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface Supplier {
    id: string;
    name: string;
    cnpj: string;
    address: string;
    email: string;
    phone: string;
    contact_name: string;
    categories: string[];
    created_at: string;
}

const Suppliers: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [contactName, setContactName] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const productCategories = [
        'Informática',
        'Papelaria',
        'Limpeza',
        'Alimentos',
        'Esportes'
    ];

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .order('name');

            if (error) throw error;
            setSuppliers(data || []);
        } catch (error: any) {
            alert('Erro ao buscar fornecedores: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setName(supplier.name);
        setCnpj(supplier.cnpj || '');
        setAddress(supplier.address || '');
        setEmail(supplier.email || '');
        setPhone(supplier.phone || '');
        setContactName(supplier.contact_name || '');
        setSelectedCategories(supplier.categories || []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingSupplier(null);
        setName('');
        setCnpj('');
        setAddress('');
        setEmail('');
        setPhone('');
        setContactName('');
        setSelectedCategories([]);
        setShowCategoryDropdown(false);
    };

    const toggleCategory = (cat: string) => {
        if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter(c => c !== cat));
        } else {
            setSelectedCategories([...selectedCategories, cat]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            alert('Por favor, preencha o nome do fornecedor.');
            return;
        }

        try {
            setSubmitting(true);
            const supplierData = {
                name,
                cnpj,
                address,
                email,
                phone,
                contact_name: contactName,
                categories: selectedCategories
            };

            if (editingSupplier) {
                const { error } = await supabase
                    .from('suppliers')
                    .update(supplierData)
                    .eq('id', editingSupplier.id);

                if (error) throw error;
                alert('Fornecedor atualizado com sucesso!');
            } else {
                const { error } = await supabase.from('suppliers').insert([supplierData]);
                if (error) throw error;
                alert('Fornecedor cadastrado com sucesso!');
            }

            resetForm();
            fetchSuppliers();
        } catch (error: any) {
            alert('Erro ao processar fornecedor: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, supplierName: string) => {
        if (!confirm(`Tem certeza que deseja excluir o fornecedor ${supplierName}?`)) return;

        try {
            const { error } = await supabase.from('suppliers').delete().eq('id', id);
            if (error) throw error;
            fetchSuppliers();
        } catch (error: any) {
            alert('Erro ao excluir fornecedor: ' + error.message);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Formulário de Cadastro */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="flex items-center gap-3 px-1">
                        <div className={`size-12 rounded-2xl ${editingSupplier ? 'bg-amber-500' : 'bg-primary'} text-white flex items-center justify-center shadow-lg transition-colors`}>
                            <span className="material-symbols-outlined text-2xl font-black">
                                {editingSupplier ? 'edit_note' : 'local_shipping'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-slate-900 dark:text-white text-xl font-black">
                                {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                            </h2>
                            <p className="text-slate-500 text-xs font-medium">
                                {editingSupplier ? `Editando: ${editingSupplier.name}` : 'Cadastrar novo parceiro logístico'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Fornecedor</label>
                                <input
                                    className="w-full h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                                    placeholder="Razão Social ou Nome Fantasia"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNPJ</label>
                                    <input
                                        className="w-full h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                                        placeholder="00.000.000/0000-00"
                                        type="text"
                                        value={cnpj}
                                        onChange={(e) => setCnpj(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço</label>
                                <input
                                    className="w-full h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                                    placeholder="Rua, Número, Bairro, Cidade - UF"
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</label>
                                    <input
                                        className="w-full h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                                        placeholder="email@fornecedor.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</label>
                                    <input
                                        className="w-full h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                                        placeholder="(00) 00000-0000"
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Contato</label>
                                <input
                                    className="w-full h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                                    placeholder="Nome do representante"
                                    type="text"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2 relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Categorias Fornecidas</label>
                                <div
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    className="w-full min-h-12 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 flex flex-wrap gap-2 items-center cursor-pointer hover:border-primary transition-all"
                                >
                                    {selectedCategories.length === 0 ? (
                                        <span className="text-slate-400 text-sm font-bold">Selecione uma ou mais categorias</span>
                                    ) : (
                                        selectedCategories.map(cat => (
                                            <span key={cat} className="bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-1 rounded-lg flex items-center gap-1">
                                                {cat}
                                                <span onClick={(e) => { e.stopPropagation(); toggleCategory(cat); }} className="material-symbols-outlined text-[12px] hover:text-red-500">close</span>
                                            </span>
                                        ))
                                    )}
                                    <span className="material-symbols-outlined ms-auto text-slate-400">arrow_drop_down</span>
                                </div>

                                {showCategoryDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden transform animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-2 flex flex-col gap-1">
                                            {productCategories.map(cat => (
                                                <div
                                                    key={cat}
                                                    onClick={() => toggleCategory(cat)}
                                                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${selectedCategories.includes(cat) ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                >
                                                    <span className="text-sm font-bold">{cat}</span>
                                                    {selectedCategories.includes(cat) && <span className="material-symbols-outlined text-sm">check</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full ${editingSupplier ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-primary/90'} text-white font-black uppercase text-xs tracking-widest h-12 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50`}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {submitting ? 'sync' : (editingSupplier ? 'save' : 'check_circle')}
                                    </span>
                                    {submitting ? (editingSupplier ? 'Salvando...' : 'Cadastrando...') : (editingSupplier ? 'Salvar Fornecedor' : 'Cadastrar Fornecedor')}
                                </button>
                                <button
                                    className="w-full border border-slate-200 dark:border-slate-800 dark:text-white font-black uppercase text-[10px] tracking-widest h-10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    type="button"
                                    onClick={resetForm}
                                >
                                    {editingSupplier ? 'Cancelar Edição' : 'Limpar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Listagem de Fornecedores */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-2xl font-black">supervised_user_circle</span>
                            </div>
                            <div>
                                <h2 className="text-slate-900 dark:text-white text-xl font-black">Fornecedores Homologados</h2>
                                <p className="text-slate-500 text-xs font-medium">Parceiros cadastrados para cotação e entrega</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={fetchSuppliers}
                                className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:text-primary transition-all"
                            >
                                <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center p-20">
                                <div className="flex flex-col items-center gap-4">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 animate-spin">sync</span>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando Fornecedores...</p>
                                </div>
                            </div>
                        ) : suppliers.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center p-20">
                                <div className="flex flex-col items-center gap-4">
                                    <span className="material-symbols-outlined text-4xl text-slate-200">person_off</span>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhum fornecedor cadastrado</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <div className="min-w-[800px] lg:min-w-0">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                            <tr>
                                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fornecedor</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categorias</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail / Tel</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {suppliers.map((supplier) => (
                                                <tr key={supplier.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${editingSupplier?.id === supplier.id ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900 dark:text-slate-200">{supplier.name}</span>
                                                            <span className="text-[10px] font-mono text-slate-400">{supplier.cnpj}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{supplier.contact_name || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {supplier.categories && supplier.categories.length > 0 ? (
                                                                supplier.categories.map(cat => (
                                                                    <span key={cat} className="text-[9px] font-black uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                                        {cat}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[9px] font-medium text-slate-400 italic">Nenhuma registrada</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-medium text-slate-500">{supplier.email}</span>
                                                            <span className="text-xs font-medium text-slate-500">{supplier.phone}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => handleEdit(supplier)}
                                                                className={`p-1.5 rounded-lg transition-all ${editingSupplier?.id === supplier.id ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary'}`}
                                                                title="Editar fornecedor"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(supplier.id, supplier.name)}
                                                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                                                title="Excluir fornecedor"
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
                                Total: {suppliers.length} {suppliers.length === 1 ? 'fornecedor cadastrado' : 'fornecedores cadastrados'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Suppliers;
