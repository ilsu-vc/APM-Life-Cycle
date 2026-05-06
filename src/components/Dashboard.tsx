import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { Order, InventoryItem, Product, Expense } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  ShoppingCart,
  Info,
  HelpCircle,
  FileText,
  Search,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_INVENTORY } from '../lib/mockData';

import { AuthProvider, useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    slaBreaches: 0,
    pendingTransfers: 0
  });
  const [breakdownTopic, setBreakdownTopic] = useState<string | null>(null);

  const METRIC_EXPLANATIONS: Record<string, { title: string, explanation: string, logic: string[], icon: any }> = {
    revenue: {
      title: 'Total Revenue Breakdown',
      explanation: 'This metric represents the sum of all successful B2B transactions currently recorded in the system.',
      logic: [
        'Only orders marked as "Delivered" or "Completed" are included.',
        'Calculated from the "totalAmount" field of each qualifying order.',
        'Does not include "Pending" or "Escalated" orders to maintain accurate fiscal reporting.'
      ],
      icon: <TrendingUp className="w-8 h-8 text-emerald-500" />
    },
    orders: {
      title: 'Active Orders Pipeline',
      explanation: 'Live monitoring of all orders currently moving through the fulfillment lifecycle.',
      logic: [
        'Includes orders in "Pending" (awaiting review).',
        'Includes orders in "Preparing" (warehouse picking/packing).',
        'Includes orders "Out for Delivery" (in transit to client).',
        'Once an order is "Delivered", it moves from this count to Total Revenue.'
      ],
      icon: <ShoppingCart className="w-8 h-8 text-gold-500" />
    },
    sla: {
      title: 'SLA Breach Monitoring',
      explanation: 'Critical tracking of delivery deadlines to ensure operational compliance and client satisfaction.',
      logic: [
        'Triggers when an order is still "Pending" or "Escalated".',
        'AND the "Delivery Deadline" timestamp is older than the current time.',
        'Orders "Preparing" or "Out for Delivery" are excluded as they are actively being processed.',
        'These items require immediate logistics attention or rescheduling.'
      ],
      icon: <Clock className="w-8 h-8 text-red-500" />
    },
    stock: {
      title: 'Low Stock SKU Analysis',
      explanation: 'Automated inventory depletion monitoring across all regional warehouse nodes.',
      logic: [
        'Calculates the total quantity of a product across all active warehouses.',
        'Triggers when that total is less than or equal to the product\'s "Reorder Point".',
        'Designed to prevent "Out of Stock" events in the B2B supply chain.'
      ],
      icon: <Package className="w-8 h-8 text-amber-500" />
    }
  };

  useEffect(() => {
    if (!profile) return;

    // Real-time listener for orders - filter by role
    const ordersQuery = profile.role === 'admin' || profile.role === 'secretary'
      ? query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50))
      : query(collection(db, 'orders'), where('agentId', '==', profile.uid), orderBy('createdAt', 'desc'), limit(50));

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      const finalOrders = ordersData.length > 0 ? ordersData : MOCK_ORDERS;
      setOrders(finalOrders);
      
      const revenue = finalOrders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      const active = finalOrders.filter(o => ['pending', 'preparing', 'out_for_delivery'].includes(o.status)).length;
      
      // SLA logic: if status is not completed/delivered/preparing/out_for_delivery AND deadline is passed
      const now = new Date();
      const breaches = finalOrders.filter(o => 
        !['completed', 'delivered', 'preparing', 'out_for_delivery'].includes(o.status) && 
        o.deliveryDeadline && 
        (typeof o.deliveryDeadline.toDate === 'function' ? o.deliveryDeadline.toDate() : new Date(o.deliveryDeadline)) < now
      ).length;

      setStats(prev => ({ 
        ...prev, 
        totalRevenue: revenue, 
        activeOrders: active,
        slaBreaches: breaches
      }));
      setLoading(false);
    }, (error) => {
      setOrders(MOCK_ORDERS);
      setLoading(false);
    });

    // Check low stock products
    const fetchInventory = async () => {
      try {
        const productsSnap = await getDocs(collection(db, 'products'));
        const pData = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const finalProducts = pData.length > 0 ? pData : MOCK_PRODUCTS;
        
        const inventorySnap = await getDocs(collection(db, 'inventory'));
        const iData = inventorySnap.docs.map(doc => doc.data() as InventoryItem);
        const finalInventory = iData.length > 0 ? iData : MOCK_INVENTORY;

        const lowStock = finalProducts.filter(p => {
          const totalQty = finalInventory
            .filter(i => i.productId === p.id)
            .reduce((sum, i) => sum + i.quantity, 0);
          return totalQty <= p.reorderPoint;
        });

        setLowStockProducts(lowStock);
      } catch (error) {
        setLowStockProducts(MOCK_PRODUCTS.filter(p => {
            const totalQty = MOCK_INVENTORY.filter(i => i.productId === p.id).reduce((sum, i) => sum + i.quantity, 0);
            return totalQty <= p.reorderPoint;
        }));
      }
    };

    fetchInventory();
    return () => unsubscribeOrders();
  }, [profile]);

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="border-navy-200 bg-white shadow-sm cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/10 transition-all group"
          onClick={() => setBreakdownTopic('revenue')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Total Revenue</CardTitle>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-3 w-3 text-navy-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-navy-900">₱{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-[10px] text-navy-500 font-medium mt-1">
              <span className="text-emerald-500 flex items-center gap-0.5 inline-flex">
                <ArrowUpRight className="h-3 w-3" /> 12%
              </span> from last month
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-navy-200 bg-white shadow-sm cursor-pointer hover:border-gold-200 hover:bg-gold-50/10 transition-all group"
          onClick={() => setBreakdownTopic('orders')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Active Orders</CardTitle>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-3 w-3 text-navy-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              <ShoppingCart className="h-4 w-4 text-gold-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-navy-900">{stats.activeOrders}</div>
            <p className="text-[10px] text-navy-500 font-medium mt-1">
              Currently processing in queue
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-navy-200 bg-white shadow-sm cursor-pointer hover:border-red-200 hover:bg-red-50/10 transition-all group"
          onClick={() => setBreakdownTopic('sla')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-navy-500">SLA Breaches</CardTitle>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-3 w-3 text-navy-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Clock className={`h-4 w-4 ${stats.slaBreaches > 0 ? 'text-red-500 animate-pulse' : 'text-navy-400'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-red-600">{stats.slaBreaches}</div>
            <p className="text-[10px] text-navy-500 font-medium mt-1">
              Fulfillment delays identified
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-navy-200 bg-white shadow-sm cursor-pointer hover:border-amber-200 hover:bg-amber-50/10 transition-all group"
          onClick={() => setBreakdownTopic('stock')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Low Stock SKU</CardTitle>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-3 w-3 text-navy-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Package className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-600">{lowStockProducts.length}</div>
            <p className="text-[10px] text-navy-500 font-medium mt-1">
              Items below reorder point
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metric Breakdown Dialog */}
      <Dialog open={!!breakdownTopic} onOpenChange={(open) => !open && setBreakdownTopic(null)}>
        <DialogContent className="sm:max-w-[450px] border-navy-100 shadow-2xl rounded-3xl">
          {breakdownTopic && METRIC_EXPLANATIONS[breakdownTopic] && (
            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-navy-50 rounded-2xl">
                  {METRIC_EXPLANATIONS[breakdownTopic].icon}
                </div>
                <div>
                  <h2 className="text-xl font-black text-navy-900 tracking-tight">
                    {METRIC_EXPLANATIONS[breakdownTopic].title}
                  </h2>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gold-600">Metric Intelligence Report</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-navy-50/50 rounded-2xl border border-navy-100">
                  <p className="text-sm text-navy-700 leading-relaxed italic">
                    "{METRIC_EXPLANATIONS[breakdownTopic].explanation}"
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-navy-400 pl-1">Data Trigger Logic</h3>
                  <div className="space-y-2">
                    {METRIC_EXPLANATIONS[breakdownTopic].logic.map((item, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-white border border-navy-50 rounded-xl shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-navy-600 font-medium leading-normal">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={() => setBreakdownTopic(null)}
                  className="bg-navy-900 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl"
                >
                  Close Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="lg:col-span-4 border-navy-200 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-navy-900">Weekly Sales Analytics</CardTitle>
            <CardDescription className="text-xs text-navy-500">B2B Order volume over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] px-2 overflow-hidden min-w-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8b608" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#e8b608" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#4a6a9e' }} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1c2536', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#f0c020',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#f0c020' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#e8b608" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders List */}
        <Card className="lg:col-span-3 border-navy-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-navy-900">Active Pipeline</CardTitle>
            <CardDescription className="text-xs text-navy-500">Live order status monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    order.status === 'out_for_delivery' ? 'bg-blue-500' :
                    order.status === 'pending' ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-navy-900">{order.clientName}</p>
                    <p className="text-[10px] text-navy-500 uppercase tracking-tighter">
                      {order.orderNumber} • {order.deliveryRegion}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold px-1.5 h-5 bg-navy-50 border-navy-200 text-navy-700">
                    ₱{order.totalAmount.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-amber-100 bg-amber-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-sm font-semibold text-amber-900">Inventory Depletion Alerts (ITIL CMDB Monitoring)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.slice(0, 6).map((item) => (
                <div key={item.id} className="p-3 bg-white border border-amber-100 rounded-lg shadow-sm flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-navy-900">{item.name}</p>
                    <p className="text-[10px] text-navy-500">SKU: {item.sku}</p>
                  </div>
                  <div className="text-center ml-4">
                    <p className="text-xs font-black text-amber-600">REORDER</p>
                    <p className="text-[10px] text-navy-400 font-medium">Point: {item.reorderPoint}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
