export interface LineItem {
  price: number;
  qty: number;
}

export interface ShippingRule {
  /** Flat fee charged when the discounted subtotal is below `freeAbove`. */
  fee: number;
  freeAbove: number;
}

function assertPercent(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`${name} must be within 0-100, got ${value}`);
  }
}

function assertLineItem(item: LineItem, index: number): void {
  if (!Number.isFinite(item.price) || item.price < 0) {
    throw new RangeError(`items[${index}].price must be >= 0, got ${item.price}`);
  }
  if (!Number.isInteger(item.qty) || item.qty < 0) {
    throw new RangeError(`items[${index}].qty must be a non-negative integer, got ${item.qty}`);
  }
}

function assertShippingRule(rule: ShippingRule): void {
  if (!Number.isFinite(rule.fee) || rule.fee < 0) {
    throw new RangeError(`shipping fee must be >= 0, got ${rule.fee}`);
  }
  if (!Number.isFinite(rule.freeAbove)) {
    throw new RangeError(`shipping freeAbove must be finite, got ${rule.freeAbove}`);
  }
}

function assertMinorUnits(minorUnits: number): void {
  if (!Number.isInteger(minorUnits) || minorUnits < 0 || minorUnits > 8) {
    throw new RangeError(`minorUnits must be an integer within 0-8, got ${minorUnits}`);
  }
}

/** Subtotal before any discount. */
export function subtotal(items: LineItem[]): number {
  items.forEach(assertLineItem);
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/** `percent` is 0-100. */
export function applyDiscount(total: number, percent: number): number {
  assertPercent("discount percent", percent);
  return total - total * (percent / 100);
}

/** `rate` is 0-100. */
export function applyTax(total: number, rate: number): number {
  assertPercent("tax rate", rate);
  return total + total * (rate / 100);
}

/** Shipping fee for a discounted subtotal; free at or above the threshold. */
export function shippingFee(discounted: number, rule: ShippingRule): number {
  assertShippingRule(rule);
  return discounted >= rule.freeAbove ? 0 : rule.fee;
}

/**
 * Rounds to the currency's minor unit (half away from zero).
 * `minorUnits` is the number of decimals, e.g. 2 for USD, 0 for JPY.
 */
export function roundToMinorUnit(amount: number, minorUnits = 2): number {
  assertMinorUnits(minorUnits);
  const factor = 10 ** minorUnits;
  // toPrecision(15) strips binary error first: 1.005 * 100 is really 100.49999…, so a bare round loses a cent.
  const scaled = Number((Math.abs(amount) * factor).toPrecision(15));
  return (Math.sign(amount) * Math.round(scaled)) / factor;
}

/**
 * Subtotal, then discount, then optional shipping, then tax on that amount.
 * Returns an exact float, NOT a chargeable amount — the caller must round to
 * the currency's minor unit before billing.
 */
export function orderTotal(
  items: LineItem[],
  discountPercent: number,
  taxRate: number,
  shipping?: ShippingRule,
): number {
  const discounted = applyDiscount(subtotal(items), discountPercent);
  const withShipping = shipping ? discounted + shippingFee(discounted, shipping) : discounted;
  return applyTax(withShipping, taxRate);
}

/** `orderTotal` rounded to a chargeable amount. */
export function chargeableTotal(
  items: LineItem[],
  discountPercent: number,
  taxRate: number,
  shipping?: ShippingRule,
  minorUnits = 2,
): number {
  return roundToMinorUnit(orderTotal(items, discountPercent, taxRate, shipping), minorUnits);
}
