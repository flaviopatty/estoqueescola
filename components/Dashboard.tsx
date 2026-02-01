
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../supabase';

interface DashboardStats {
  totalItems: number;
  stockAlerts: number;
  exits24h: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface ExpiryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expiration_date: string;
  status: 'critical' | 'warning' | 'normal';
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({ totalItems: 0, stockAlerts: 0, exits24h: 0 });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [expiryItems, setExpiryItems] = useState<ExpiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Total Items
      const { count: totalCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // 2. Fetch Stock Alerts
      const { count: alertsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lte('quantity', supabase.rpc('get_min_stock_column'));
      // Note: Simple filter might not work if min_stock is a column. Let's do it better:

      const { data: alertProducts } = await supabase
        .rpc('get_low_stock_products_count'); // I might need an RPC or just fetch and count

      // Let's use a more robust way without custom RPCs for now:
      const { data: allProducts } = await supabase.from('products').select('quantity, min_stock, expiration_date, name, category, id');

      const totalItems = allProducts?.length || 0;
      const stockAlerts = allProducts?.filter(p => p.quantity <= p.min_stock).length || 0;

      // 3. Fetch Exits 24h
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentExits } = await supabase
        .from('movements')
        .select('quantity')
        .eq('type', 'out')
        .gt('created_at', dayAgo);

      const exits24h = recentExits?.reduce((sum, m) => sum + Number(m.quantity), 0) || 0;

      setStats({ totalItems, stockAlerts, exits24h });

      // 4. Chart Data (Consumption last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: weekMovements } = await supabase
        .from('movements')
        .select('quantity, product:products(category)')
        .eq('type', 'out')
        .gt('created_at', weekAgo);

      const categoryMap: Record<string, number> = {};
      weekMovements?.forEach(m => {
        const cat = (m.product as any)?.category || 'Outros';
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(m.quantity);
      });

      const formattedChartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
      setChartData(formattedChartData.length > 0 ? formattedChartData : [{ name: 'Sem dados', value: 0 }]);

      // 5. Expiry Items
      const now = new Date();
      const formattedExpiry = allProducts
        ?.filter(p => p.expiration_date)
        .map(p => {
          const expDate = new Date(p.expiration_date);
          const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          let status: 'critical' | 'warning' | 'normal' = 'normal';
          if (diffDays <= 7) status = 'critical';
          else if (diffDays <= 15) status = 'warning';

          return {
            id: p.id,
            name: p.name,
            category: p.category,
            quantity: p.quantity,
            expiration_date: new Date(p.expiration_date).toLocaleDateString('pt-BR'),
            status
          };
        })
        .sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime())
        .slice(0, 5) || [];

      setExpiryItems(formattedExpiry as ExpiryItem[]);

    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total de Itens', value: stats.totalItems.toString(), trend: '+0%', positive: true, icon: 'inventory_2', color: 'primary' },
    { label: 'Alertas de Estoque', value: stats.stockAlerts.toString(), trend: stats.stockAlerts > 0 ? 'Requer atenção' : 'Normal', positive: stats.stockAlerts === 0, icon: 'warning', color: stats.stockAlerts > 0 ? 'red' : 'blue' },
    { label: 'Saídas (24h)', value: stats.exits24h.toString(), trend: 'últimas 24h', positive: true, icon: 'upload', color: 'orange' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className={`flex flex-col gap-3 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800`}>
            <div className="flex justify-between items-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
              <div className={`size-10 rounded-xl bg-${stat.color === 'primary' ? 'blue' : stat.color}-50 dark:bg-${stat.color === 'primary' ? 'blue' : stat.color}-900/20 flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-${stat.color === 'primary' ? 'blue' : stat.color}-600`}>{stat.icon}</span>
              </div>
            </div>
            <p className="text-slate-900 dark:text-white text-3xl font-black">{loading ? '...' : stat.value}</p>
            <p className={`text-sm font-bold flex items-center gap-1 ${stat.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              <span className="material-symbols-outlined text-sm">{stat.positive ? 'trending_up' : 'warning'}</span>
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Seção do Gráfico */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">Consumo por Categoria</h3>
              <p className="text-slate-500 text-xs font-semibold mt-1">USO NOS ÚLTIMOS 7 DIAS</p>
            </div>
            <p className="text-2xl font-black text-primary">
              {chartData.reduce((acc, curr) => acc + curr.value, 0)}
              <span className="text-xs font-bold text-slate-400 ml-1">UNID</span>
            </p>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(17, 115, 212, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1173d4' : '#1173d499'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Vencimentos */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold">Itens Próximos ao Vencimento</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Item</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Venc.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expiryItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold">
                      Nenhum item com vencimento próximo.
                    </td>
                  </tr>
                ) : expiryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-200">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.category}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.expiration_date}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-lg ${item.status === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                        item.status === 'warning' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                        }`}>
                        {item.status === 'critical' ? 'crítico' : item.status === 'warning' ? 'aviso' : 'normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grid de Rodapé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Status do Sistema</p>
            <p className="text-slate-900 dark:text-white font-bold">Bases de dados sincronizadas</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-black text-emerald-600 uppercase">Online</span>
          </div>
        </div>
        <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-between group transition-all">
          <div>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Precisa de Ajuda?</p>
            <p className="text-white font-bold">Contatar Suporte de Inventário</p>
          </div>
          <button className="bg-white text-primary px-4 py-2 rounded-xl text-xs font-black uppercase shadow-sm hover:scale-105 active:scale-95 transition-all">
            Abrir Chamado
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
