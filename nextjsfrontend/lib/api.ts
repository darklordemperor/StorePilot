import type { AuthResponse, LoginInput, RegisterInput } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type ApiOptions = RequestInit & {
  accessToken?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly path?: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : Array.isArray(payload?.message)
          ? payload.message.join(", ")
        : "Request failed";
    throw new ApiError(message, response.status, payload?.code, payload?.path);
  }

  return payload as T;
}

export const api = {
  register(input: RegisterInput) {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  login(input: LoginInput) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  refresh(refreshToken: string) {
    return request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },
  logout(refreshToken: string) {
    return request<{ success: boolean }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },
  me(accessToken: string) {
    return request<AuthResponse["user"]>("/auth/me", { accessToken });
  },
  products(accessToken: string) {
    return request<Product[]>("/products", { accessToken });
  },
  stores(accessToken: string) {
    return request<Store[]>("/stores", { accessToken });
  },
  branches(accessToken: string) {
    return request<Branch[]>("/branches", { accessToken });
  },
  inventory(accessToken: string) {
    return request<InventoryStock[]>("/inventory-stock", { accessToken });
  },
  stockMovements(accessToken: string) {
    return request<StockMovement[]>("/stock-movements", { accessToken });
  },
  customers(accessToken: string) {
    return request<Customer[]>("/customers", { accessToken });
  },
  salesOrders(accessToken: string) {
    return request<SalesOrder[]>("/sales-orders", { accessToken });
  },
  statistics(accessToken: string, input: StatisticsQuery) {
    const params = new URLSearchParams();
    params.set("period", input.period);
    if (input.month) params.set("month", String(input.month));
    if (input.year) params.set("year", String(input.year));

    return request<StatisticsResponse>(`/statistics?${params.toString()}`, {
      accessToken,
    });
  },
  users(accessToken: string) {
    return request<AuthResponse["user"][]>("/users", { accessToken });
  },
  updateUser(accessToken: string, id: string, input: Partial<AuthResponse["user"]>) {
    return request<AuthResponse["user"]>(`/users/${id}`, {
      method: "PATCH",
      accessToken,
      body: JSON.stringify(input),
    });
  },
  deleteUser(accessToken: string, id: string) {
    return request<AuthResponse["user"]>(`/users/${id}`, {
      method: "DELETE",
      accessToken,
    });
  },
  createProduct(accessToken: string, input: CreateProductInput) {
    return request<Product>("/products", {
      method: "POST",
      accessToken,
      body: JSON.stringify(input),
    });
  },
  deleteProduct(accessToken: string, id: string) {
    return request<Product>(`/products/${id}`, {
      method: "DELETE",
      accessToken,
    });
  },
  createBranch(accessToken: string, input: CreateBranchInput) {
    return request<Branch>("/branches", {
      method: "POST",
      accessToken,
      body: JSON.stringify(input),
    });
  },
  deleteBranch(accessToken: string, id: string) {
    return request<Branch>(`/branches/${id}`, {
      method: "DELETE",
      accessToken,
    });
  },
  createStockMovement(accessToken: string, input: CreateStockMovementInput) {
    return request<StockMovement>("/stock-movements", {
      method: "POST",
      accessToken,
      body: JSON.stringify(input),
    });
  },
  deleteStockMovement(accessToken: string, id: string) {
    return request<StockMovement>(`/stock-movements/${id}`, {
      method: "DELETE",
      accessToken,
    });
  },
  createCustomer(accessToken: string, input: CreateCustomerInput) {
    return request<Customer>("/customers", {
      method: "POST",
      accessToken,
      body: JSON.stringify(input),
    });
  },
  deleteCustomer(accessToken: string, id: string) {
    return request<Customer>(`/customers/${id}`, {
      method: "DELETE",
      accessToken,
    });
  },
  createSalesOrder(accessToken: string, input: CreateSalesOrderInput) {
    return request<SalesOrder>("/sales-orders", {
      method: "POST",
      accessToken,
      body: JSON.stringify(input),
    });
  },
  updateSalesOrder(accessToken: string, id: string, input: Partial<SalesOrder>) {
    return request<SalesOrder>(`/sales-orders/${id}`, {
      method: "PATCH",
      accessToken,
      body: JSON.stringify(input),
    });
  },
  deleteSalesOrder(accessToken: string, id: string) {
    return request<SalesOrder>(`/sales-orders/${id}`, {
      method: "DELETE",
      accessToken,
    });
  },
};

export type Store = {
  id: string;
  name: string;
  code: string | null;
  description?: string | null;
  branches?: Branch[];
  createdAt: string;
};

export type Branch = {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  storeId: string;
  store?: Store;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string | null;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string | number;
  cost: string | number;
  isActive: boolean;
  storeId: string;
  categoryId: string | null;
  store?: Store;
  category?: Category | null;
  createdAt: string;
};

export type InventoryStock = {
  id: string;
  quantity: number;
  productId: string;
  branchId: string;
  product?: Product;
  branch?: Branch;
  updatedAt: string;
};

export type StockMovement = {
  id: string;
  type: "IN" | "OUT" | "ADJUSTMENT" | "SALE" | "RETURN";
  quantity: number;
  note: string | null;
  productId: string;
  branchId: string;
  userId: string | null;
  product?: Product;
  branch?: Branch;
  user?: AuthResponse["user"] | null;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  storeId: string;
  store?: Store;
  createdAt: string;
};

export type SalesOrder = {
  id: string;
  orderNumber: string;
  status: "DRAFT" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  totalAmount: string | number;
  storeId: string;
  branchId: string;
  customerId: string | null;
  userId: string | null;
  customer?: Customer | null;
  branch?: Branch;
  user?: AuthResponse["user"] | null;
  items?: Array<{
    id: string;
    quantity: number;
    lineTotal: string | number;
    product?: Product;
  }>;
  createdAt: string;
};

export type CreateProductInput = {
  name: string;
  sku: string;
  price: number;
  cost?: number;
  storeId: string;
  categoryId?: string;
  isActive?: boolean;
};

export type CreateBranchInput = {
  name: string;
  code?: string;
  address?: string;
  storeId: string;
};

export type CreateStockMovementInput = {
  type: "IN" | "OUT" | "ADJUSTMENT" | "SALE" | "RETURN";
  quantity: number;
  productId: string;
  branchId: string;
  note?: string;
};

export type CreateCustomerInput = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  storeId: string;
};

export type CreateSalesOrderInput = {
  orderNumber: string;
  status?: "DRAFT" | "COMPLETED";
  storeId: string;
  branchId: string;
  customerId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice?: number;
  }>;
};

export type StatisticsPeriod = "week" | "month" | "year";

export type StatisticsQuery = {
  period: StatisticsPeriod;
  month?: number;
  year?: number;
};

export type StatisticsResponse = {
  period: StatisticsPeriod;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  totals: {
    revenue: number;
    orderCount: number;
    unitsSold: number;
    productBuyCount: number;
    productReturnCount: number;
    customerCount: number;
  };
  mix: Array<{ label: string; value: number }>;
  series: Array<{
    date: string;
    revenue: number;
    orderCount: number;
    unitsSold: number;
    productBuyCount: number;
    productReturnCount: number;
    customerCount: number;
  }>;
};
