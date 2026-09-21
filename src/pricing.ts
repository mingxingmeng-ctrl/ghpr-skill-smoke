export interface LineItem {
  price: number;
  qty: number;
}

/** Subtotal before any discount. */
export function subtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/** `percent` is 0-100. */
export function applyDiscount(total: number, percent: number): number {
  return total - total * (percent / 100);
}
