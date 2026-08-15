/**
 * Delivery Charge Calculation Utility
 * 
 * Business Rule:
 * First 1kg (1000g) = ₹50
 * Any order <= 1000g = ₹50
 * After 1kg: Every additional 500g OR PART OF 500g = ₹20
 * 
 * Formula:
 * IF totalWeightGrams <= 1000:
 *   deliveryCharge = 50
 * ELSE:
 *   extraWeight = totalWeightGrams - 1000
 *   extraCharge = Math.ceil(extraWeight / 500) * 20
 *   deliveryCharge = 50 + extraCharge
 */
export function calculateDeliveryCharge(totalWeightGrams) {
  const weight = Math.max(0, Number(totalWeightGrams) || 0);
  if (weight <= 1000) {
    return 50;
  }

  const extraWeight = weight - 1000;
  const extraCharge = Math.ceil(extraWeight / 500) * 20;

  return 50 + extraCharge;
}
