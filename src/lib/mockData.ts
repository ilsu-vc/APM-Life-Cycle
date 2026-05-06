import { Warehouse, Product, InventoryItem, Order, Transfer, Expense, ExpenseCategory } from '../types';

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'wh-main', name: 'Main Hub - Valenzuela', location: 'Valenzuela City', address: '123 MacArthur Highway, Valenzuela', status: 'active', order: 0 },
  { id: 'wh-north', name: 'North Node - Quezon City', location: 'Quezon City', address: '456 Tandang Sora Ave, QC', status: 'active', order: 1 },
  { id: 'wh-south', name: 'South Port - Cavite', location: 'Cavite City', address: '789 Marine Blvd, Cavite', status: 'active', order: 2 }
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-bike-1', sku: 'AP-RD-001', name: 'AeroPro Road Master', category: 'Bicycles', description: 'High-performance carbon fiber road bike.', basePrice: 45000, wholesalePrice: 52000, dealerPrice: 48000, minStockLevel: 5, reorderPoint: 10, supplierMoq: 20, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod-part-1', sku: 'AP-CS-002', name: 'Shimano Cassette 11-34T', category: 'Parts', description: '11-speed high-durability cassette.', basePrice: 2500, wholesalePrice: 3500, dealerPrice: 3000, minStockLevel: 10, reorderPoint: 20, supplierMoq: 50, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod-gear-1', sku: 'AP-HM-003', name: 'AeroShell Helmet L', category: 'Gears', description: 'MIPS-certified aerodynamic racing helmet.', basePrice: 4000, wholesalePrice: 5500, dealerPrice: 4800, minStockLevel: 15, reorderPoint: 25, supplierMoq: 30, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod-gear-2', sku: 'AP-GL-004', name: 'Pro-Grip Racing Gloves', category: 'Gears', description: 'High-visibility padded racing gloves.', basePrice: 800, wholesalePrice: 1500, dealerPrice: 1200, minStockLevel: 20, reorderPoint: 40, supplierMoq: 100, createdAt: new Date(), updatedAt: new Date() }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', productId: 'prod-bike-1', warehouseId: 'wh-main', quantity: 15, lastUpdated: new Date() },
  { id: 'inv-2', productId: 'prod-bike-1', warehouseId: 'wh-north', quantity: 8, lastUpdated: new Date() },
  { id: 'inv-3', productId: 'prod-part-1', warehouseId: 'wh-main', quantity: 45, lastUpdated: new Date() },
  { id: 'inv-4', productId: 'prod-gear-1', warehouseId: 'wh-south', quantity: 30, lastUpdated: new Date() },
  { id: 'inv-5', productId: 'prod-gear-2', warehouseId: 'wh-main', quantity: 120, lastUpdated: new Date() }
];

// Generate dates for the last 6 months
const getMonthDate = (monthsAgo: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d;
};

export const MOCK_ORDERS: Order[] = [
  // Current Month - Various Statuses
  { id: 'order-1', orderNumber: 'ORD-100250', agentId: 'agent-1', clientId: 'cli-001', clientName: 'Manila Bike Shop', status: 'pending', totalAmount: 45000, paymentStatus: 'unpaid', deliveryRegion: 'Metro Manila', deliveryDeadline: getMonthDate(0), createdAt: getMonthDate(0), updatedAt: getMonthDate(0) },
  { id: 'order-2', orderNumber: 'ORD-100251', agentId: 'agent-1', clientId: 'cli-002', clientName: 'Quezon City Hub', status: 'preparing', totalAmount: 12000, paymentStatus: 'partially_paid', deliveryRegion: 'Metro Manila', deliveryDeadline: getMonthDate(0), createdAt: getMonthDate(0), updatedAt: getMonthDate(0) },
  { id: 'order-3', orderNumber: 'ORD-100252', agentId: 'agent-1', clientId: 'cli-003', clientName: 'Cebu Sports', status: 'out_for_delivery', totalAmount: 95000, paymentStatus: 'paid', deliveryRegion: 'Visayas', deliveryDeadline: getMonthDate(0), createdAt: getMonthDate(0), updatedAt: getMonthDate(0) },
  { id: 'order-4', orderNumber: 'ORD-100253', agentId: 'agent-1', clientId: 'cli-004', clientName: 'Davao Cyclists', status: 'escalated', totalAmount: 110000, paymentStatus: 'defaulted', deliveryRegion: 'Mindanao', deliveryDeadline: getMonthDate(0), createdAt: getMonthDate(0), updatedAt: getMonthDate(0) },
  { id: 'order-5', orderNumber: 'ORD-100254', agentId: 'agent-1', clientId: 'cli-005', clientName: 'Luzon Trading', status: 'completed', totalAmount: 80000, paymentStatus: 'paid', deliveryRegion: 'Luzon', deliveryDeadline: getMonthDate(0), createdAt: getMonthDate(0), updatedAt: getMonthDate(0) },
  
  // Historical - Mostly Delivered
  { id: 'order-apr-1', orderNumber: 'ORD-100230', agentId: 'agent-1', clientId: 'cli-002', clientName: 'Quezon City Hub', status: 'delivered', totalAmount: 120000, paymentStatus: 'paid', deliveryRegion: 'Metro Manila', deliveryDeadline: getMonthDate(1), createdAt: getMonthDate(1), updatedAt: getMonthDate(1) },
  { id: 'order-mar-1', orderNumber: 'ORD-100220', agentId: 'agent-1', clientId: 'cli-003', clientName: 'Cebu Sports', status: 'delivered', totalAmount: 95000, paymentStatus: 'paid', deliveryRegion: 'Visayas', deliveryDeadline: getMonthDate(2), createdAt: getMonthDate(2), updatedAt: getMonthDate(2) },
  { id: 'order-feb-1', orderNumber: 'ORD-100210', agentId: 'agent-1', clientId: 'cli-004', clientName: 'Davao Cyclists', status: 'delivered', totalAmount: 110000, paymentStatus: 'paid', deliveryRegion: 'Mindanao', deliveryDeadline: getMonthDate(3), createdAt: getMonthDate(3), updatedAt: getMonthDate(3) },
  { id: 'order-jan-1', orderNumber: 'ORD-100200', agentId: 'agent-1', clientId: 'cli-005', clientName: 'Luzon Trading', status: 'delivered', totalAmount: 80000, paymentStatus: 'paid', deliveryRegion: 'Luzon', deliveryDeadline: getMonthDate(4), createdAt: getMonthDate(4), updatedAt: getMonthDate(4) },
  { id: 'order-dec-1', orderNumber: 'ORD-100190', agentId: 'agent-1', clientId: 'cli-006', clientName: 'Southern Bikes', status: 'delivered', totalAmount: 130000, paymentStatus: 'paid', deliveryRegion: 'Luzon', deliveryDeadline: getMonthDate(5), createdAt: getMonthDate(5), updatedAt: getMonthDate(5) },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'exp-may-1', category: 'Logistics', amount: 45000, description: 'Fuel & Fleet', date: getMonthDate(0), recordedBy: 'admin' },
  { id: 'exp-may-2', category: 'Warehousing', amount: 20000, description: 'Rent May', date: getMonthDate(0), recordedBy: 'admin' },
  { id: 'exp-apr-1', category: 'Logistics', amount: 38000, description: 'Fuel April', date: getMonthDate(1), recordedBy: 'admin' },
  { id: 'exp-apr-2', category: 'Warehousing', amount: 20000, description: 'Rent April', date: getMonthDate(1), recordedBy: 'admin' },
  { id: 'exp-mar-1', category: 'Logistics', amount: 42000, description: 'Maintenance', date: getMonthDate(2), recordedBy: 'admin' },
  { id: 'exp-feb-1', category: 'Marketing', amount: 60000, description: 'Expo Sponsorship', date: getMonthDate(3), recordedBy: 'admin' },
  { id: 'exp-jan-1', category: 'Logistics', amount: 35000, description: 'Fleet Expansion', date: getMonthDate(4), recordedBy: 'admin' },
  { id: 'exp-dec-1', category: 'Warehousing', amount: 25000, description: 'Inventory Audit', date: getMonthDate(5), recordedBy: 'admin' },
];

export const MOCK_TRANSFERS: Transfer[] = [
  { id: 'tfr-1', sourceWarehouseId: 'wh-main', destinationWarehouseId: 'wh-north', productId: 'prod-bike-1', quantity: 5, status: 'in_transit', initiatedBy: 'Admin', createdAt: new Date() },
  { id: 'tfr-2', sourceWarehouseId: 'wh-south', destinationWarehouseId: 'wh-main', productId: 'prod-gear-1', quantity: 10, status: 'received', initiatedBy: 'Manager', createdAt: getMonthDate(1) }
];

export const MOCK_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat-1', name: 'Logistics', isActive: true, createdAt: new Date() },
  { id: 'cat-2', name: 'Warehousing', isActive: true, createdAt: new Date() },
  { id: 'cat-3', name: 'Marketing', isActive: true, createdAt: new Date() },
  { id: 'cat-4', name: 'Office Supplies', isActive: true, createdAt: new Date() }
];
