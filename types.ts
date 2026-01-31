
export type View = 'dashboard' | 'products' | 'entries' | 'exits' | 'reports' | 'admin' | 'suppliers' | 'inventory';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expiryDate?: string;
  status: 'critical' | 'warning' | 'normal';
}

export interface Movement {
  id: string;
  type: 'entry' | 'exit';
  item: string;
  qty: number;
  sourceDest: string;
  time: string;
  unit: string;
  user: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  min_stock: number;
  status: string;
  created_at: string;
}
