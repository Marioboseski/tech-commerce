import type { Order, OrderStatus } from '../types/order';

export type AdminStats = {
  products: number;
  orders: number;
  pendingOrders: number;
  customers: number;
};

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
};

// One row of the admin products table.
export type AdminProductListItem = {
  id: number;
  sku: string;
  name: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  updatedAt: string;
  category: AdminCategory;
};

export type ProductStatusFilter = 'active' | 'archived' | 'all';

export type AdminProductFilters = {
  page: number;
  pageSize: number;
  search: string;
  categoryId: number | undefined;
  status: ProductStatusFilter;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type SpecsRow = Record<string, string | number> | null;

// One product with everything the edit form needs. Only the specs row of
// the product's own category is filled.
export type AdminProduct = AdminProductListItem & {
  description: string;
  categoryId: number;
  laptopDetails: SpecsRow;
  mobilePhoneDetails: SpecsRow;
  computerDetails: SpecsRow;
  consoleDetails: SpecsRow;
  tabletDetails: SpecsRow;
};

// What the form sends to POST / PUT.
export type AdminProductInput = {
  sku: string;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  details: Record<string, string>;
};

// Category slug → spec field → max length, e.g. laptops → { ram: 50, ... }.
export type CategorySpecFields = Record<string, Record<string, number>>;

export type OrderStatusFilter = OrderStatus | 'ALL';

export type AdminOrderFilters = {
  page: number;
  pageSize: number;
  status: OrderStatusFilter;
  search: string;
};

export type AdminCustomer = {
  id: number;
  fullName: string;
  email: string;
};

// One row of the admin orders table.
export type AdminOrderListItem = {
  id: number;
  status: OrderStatus;
  total: number;
  createdAt: string;
  itemCount: number;
  user: AdminCustomer;
};

// The same order the customer sees, plus who ordered it and the statuses
// it may move to next (the server decides, see lib/orderStatus.ts there).
export type AdminOrder = Order & {
  customer: AdminCustomer;
  nextStatuses: OrderStatus[];
};
