import type {
  Branch,
  Customer,
  InventoryStock,
  Product,
  SalesOrder,
  StockMovement,
  Store,
} from "./api";

export function formatCurrency(value: string | number | null | undefined) {
  const numberValue = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function productStock(product: Product, inventory: InventoryStock[]) {
  return inventory
    .filter((item) => item.productId === product.id)
    .reduce((total, item) => total + item.quantity, 0);
}

export function inventoryValue(item: InventoryStock) {
  return item.quantity * Number(item.product?.price ?? 0);
}

export function totalInventoryValue(inventory: InventoryStock[]) {
  return inventory.reduce((total, item) => total + inventoryValue(item), 0);
}

export function lowStockCount(inventory: InventoryStock[]) {
  return inventory.filter((item) => item.quantity <= 10).length;
}

export function activeBranchCount(stores: Store[], branches: Branch[]) {
  return branches.length || stores.reduce((total, store) => total + (store.branches?.length ?? 0), 0);
}

export function totalSales(orders: SalesOrder[]) {
  return orders.reduce((total, order) => total + Number(order.totalAmount ?? 0), 0);
}

export function customerSpend(customer: Customer, orders: SalesOrder[]) {
  return orders
    .filter((order) => order.customerId === customer.id)
    .reduce((total, order) => total + Number(order.totalAmount ?? 0), 0);
}

export function movementQuantity(movement: StockMovement) {
  return movement.type === "IN" || movement.type === "RETURN"
    ? `+${movement.quantity}`
    : `-${movement.quantity}`;
}
