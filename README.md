# ghpr-skill-smoke
Throwaway repo to smoke-test the github-pr skill (English artifacts)

## Pricing API (`src/pricing.ts`)

| Function | Purpose |
| --- | --- |
| `subtotal(items)` | Sum of `price * qty`; rejects negative prices and non-integer qty |
| `applyDiscount(total, percent)` | Percent discount, `percent` in 0-100 |
| `applyTax(total, rate)` | Percent tax, `rate` in 0-100 |
| `shippingFee(discounted, rule)` | Flat fee, free at or above `rule.freeAbove`; rejects a negative or non-finite fee |
| `roundToMinorUnit(amount, minorUnits)` | Rounds half away from zero to the currency minor unit (`minorUnits` in 0-8) |
| `orderTotal(items, discount, tax, shipping?)` | Exact float: subtotal → discount → shipping → tax |
| `chargeableTotal(...)` | `orderTotal` rounded to the currency minor unit |

Order of operations: tax applies to the discounted subtotal **plus** shipping.
