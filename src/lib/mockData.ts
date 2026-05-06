import { Warehouse, Product, InventoryItem, Order, Transfer, Expense, ExpenseCategory } from '../types';

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'wh-main', name: 'Main Hub - Valenzuela', location: 'Valenzuela City', address: '123 MacArthur Highway, Valenzuela', status: 'active', order: 0 },
  { id: 'wh-a', name: 'Valenzuela A (Main)', location: 'Valenzuela City', address: 'Block 5, Industrial Estate, Valenzuela', status: 'active', order: 1 },
  { id: 'wh-b', name: 'Valenzuela B (Sub)', location: 'Valenzuela City', address: 'Unit 12, Logistics Park, Valenzuela', status: 'active', order: 2 }
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-bike-1', sku: 'AP-RD-001', name: 'AeroPro Road Master', category: 'Bicycles', description: 'High-performance carbon fiber road bike.', basePrice: 45000, wholesalePrice: 52000, dealerPrice: 48000, minStockLevel: 5, reorderPoint: 10, supplierMoq: 20, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod-part-1', sku: 'AP-CS-002', name: 'Shimano Cassette 11-34T', category: 'Parts', description: '11-speed high-durability cassette.', basePrice: 2500, wholesalePrice: 3500, dealerPrice: 3000, minStockLevel: 10, reorderPoint: 20, supplierMoq: 50, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod-gear-1', sku: 'AP-HM-003', name: 'AeroShell Helmet L', category: 'Gears', description: 'MIPS-certified aerodynamic racing helmet.', basePrice: 4000, wholesalePrice: 5500, dealerPrice: 4800, minStockLevel: 15, reorderPoint: 25, supplierMoq: 30, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod-gear-2', sku: 'AP-GL-004', name: 'Pro-Grip Racing Gloves', category: 'Gears', description: 'High-visibility padded racing gloves.', basePrice: 800, wholesalePrice: 1500, dealerPrice: 1200, minStockLevel: 20, reorderPoint: 40, supplierMoq: 100, createdAt: new Date(), updatedAt: new Date() }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', productId: 'prod-bike-1', warehouseId: 'wh-main', quantity: 15, lastUpdated: new Date() },
  { id: 'inv-2', productId: 'prod-bike-1', warehouseId: 'wh-a', quantity: 8, lastUpdated: new Date() },
  { id: 'inv-3', productId: 'prod-part-1', warehouseId: 'wh-main', quantity: 45, lastUpdated: new Date() },
  { id: 'inv-4', productId: 'prod-gear-1', warehouseId: 'wh-a', quantity: 30, lastUpdated: new Date() },
  { id: 'inv-5', productId: 'prod-gear-2', warehouseId: 'wh-main', quantity: 120, lastUpdated: new Date() }
];

// Generate dates
const getRelativeDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
};

const getFutureDate = (daysInFuture: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysInFuture);
  return d;
};

export const MOCK_ORDERS: Order[] = [
  // Upcoming Deadlines (Active)
  { id: 'order-1', orderNumber: 'ORD-100250', agentId: 'agent-1', clientId: 'cli-001', clientName: 'Manila Bike Shop', status: 'pending', totalAmount: 45000, paymentStatus: 'unpaid', deliveryRegion: 'Metro Manila', deliveryDeadline: getFutureDate(2), createdAt: getRelativeDate(1), updatedAt: getRelativeDate(1) },
  { id: 'order-2', orderNumber: 'ORD-100251', agentId: 'agent-1', clientId: 'cli-002', clientName: 'Quezon City Hub', status: 'preparing', totalAmount: 12000, paymentStatus: 'partially_paid', deliveryRegion: 'Metro Manila', deliveryDeadline: getFutureDate(3), createdAt: getRelativeDate(2), updatedAt: getRelativeDate(2) },
  { id: 'order-3', orderNumber: 'ORD-100252', agentId: 'agent-1', clientId: 'cli-003', clientName: 'Cebu Sports', status: 'out_for_delivery', totalAmount: 95000, paymentStatus: 'paid', deliveryRegion: 'Visayas', deliveryDeadline: getFutureDate(1), createdAt: getRelativeDate(3), updatedAt: getRelativeDate(3) },
  
  // Breached Deadlines
  { id: 'order-4', orderNumber: 'ORD-100253', agentId: 'agent-1', clientId: 'cli-004', clientName: 'Davao Cyclists', status: 'escalated', totalAmount: 110000, paymentStatus: 'defaulted', deliveryRegion: 'Mindanao', deliveryDeadline: getRelativeDate(2), createdAt: getRelativeDate(10), updatedAt: getRelativeDate(2) },
  { id: 'order-p-breach', orderNumber: 'ORD-100255', agentId: 'agent-1', clientId: 'cli-007', clientName: 'Baguio Peak Hub', status: 'pending', totalAmount: 55000, paymentStatus: 'unpaid', deliveryRegion: 'Luzon', deliveryDeadline: getRelativeDate(1), createdAt: getRelativeDate(5), updatedAt: getRelativeDate(1) },

  // Completed / Delivered (Historical)
  { id: 'order-5', orderNumber: 'ORD-100254', agentId: 'agent-1', clientId: 'cli-005', clientName: 'Luzon Trading', status: 'completed', totalAmount: 80000, paymentStatus: 'paid', deliveryRegion: 'Luzon', deliveryDeadline: getRelativeDate(1), createdAt: getRelativeDate(4), updatedAt: getRelativeDate(1) },
  { id: 'order-apr-1', orderNumber: 'ORD-100230', agentId: 'agent-1', clientId: 'cli-002', clientName: 'Quezon City Hub', status: 'delivered', totalAmount: 120000, paymentStatus: 'paid', deliveryRegion: 'Metro Manila', deliveryDeadline: getRelativeDate(15), createdAt: getRelativeDate(20), updatedAt: getRelativeDate(15) },
  { id: 'order-mar-1', orderNumber: 'ORD-100220', agentId: 'agent-1', clientId: 'cli-003', clientName: 'Cebu Sports', status: 'delivered', totalAmount: 95000, paymentStatus: 'paid', deliveryRegion: 'Visayas', deliveryDeadline: getRelativeDate(45), createdAt: getRelativeDate(50), updatedAt: getRelativeDate(45) },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'exp-may-1', category: 'Logistics', amount: 45000, description: 'Fuel & Fleet', date: getRelativeDate(2), recordedBy: 'admin' },
  { id: 'exp-may-2', category: 'Warehousing', amount: 20000, description: 'Rent May', date: getRelativeDate(5), recordedBy: 'admin' },
  { id: 'exp-apr-1', category: 'Logistics', amount: 38000, description: 'Fuel April', date: getRelativeDate(30), recordedBy: 'admin' },
  { id: 'exp-feb-1', category: 'Marketing', amount: 60000, description: 'Expo Sponsorship', date: getRelativeDate(90), recordedBy: 'admin' },
];

export const MOCK_TRANSFERS: Transfer[] = [
  { id: 'tfr-1', sourceWarehouseId: 'wh-main', destinationWarehouseId: 'wh-north', productId: 'prod-bike-1', quantity: 5, status: 'in_transit', initiatedBy: 'Admin', createdAt: new Date() },
  { id: 'tfr-2', sourceWarehouseId: 'wh-south', destinationWarehouseId: 'wh-main', productId: 'prod-gear-1', quantity: 10, status: 'received', initiatedBy: 'Manager', createdAt: getRelativeDate(30) }
];

export const MOCK_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat-1', name: 'Logistics', isActive: true, createdAt: new Date() },
  { id: 'cat-2', name: 'Warehousing', isActive: true, createdAt: new Date() },
  { id: 'cat-3', name: 'Marketing', isActive: true, createdAt: new Date() },
  { id: 'cat-4', name: 'Office Supplies', isActive: true, createdAt: new Date() }
];
