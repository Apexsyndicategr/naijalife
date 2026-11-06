/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatNaira(amount: number): string {
  if (!amount || isNaN(amount)) return '₦0';
  if (amount >= 1e24) {
    const val = amount / 1e24;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Septillion`;
  }
  if (amount >= 1e21) {
    const val = Math.round((amount / 1e21) * 10) / 10;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Sextillion`;
  }
  if (amount >= 1e18) {
    const val = amount / 1e18;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Quintillion`;
  }
  if (amount >= 1e15) {
    const val = amount / 1e15;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Quadrillion`;
  }
  if (amount >= 1e12) {
    const val = amount / 1e12;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Trillion`;
  }
  if (amount >= 1e9) {
    const val = amount / 1e9;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Billion`;
  }
  if (amount >= 1e6) {
    const val = amount / 1e6;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Million`;
  }
  if (amount >= 1e3) {
    const val = amount / 1e3;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Thousand`;
  }
  return `₦${Math.round(amount).toLocaleString()}`;
}

export function formatCAD(amount: number): string {
  if (!amount || isNaN(amount)) return '$0.00 CAD';
  if (amount >= 1e24) {
    const val = amount / 1e24;
    return `$${val % 1 === 0 ? val : val.toFixed(1)} Septillion CAD`;
  }
  if (amount >= 1e21) {
    const val = Math.round((amount / 1e21) * 10) / 10;
    return `$${val % 1 === 0 ? val : val.toFixed(1)} Sextillion CAD`;
  }
  if (amount >= 1e18) {
    const val = amount / 1e18;
    return `$${val % 1 === 0 ? val : val.toFixed(1)} Quintillion CAD`;
  }
  if (amount >= 1e15) {
    const val = amount / 1e15;
    return `$${val % 1 === 0 ? val : val.toFixed(1)} Quadrillion CAD`;
  }
  if (amount >= 1e12) {
    const val = amount / 1e12;
    return `$${val % 1 === 0 ? val : val.toFixed(1)} Trillion CAD`;
  }
  if (amount >= 1e9) {
    const val = amount / 1e9;
    return `$${val % 1 === 0 ? val : val.toFixed(1)} Billion CAD`;
  }
  if (amount >= 1e6) {
    const val = amount / 1e6;
    return `$${val % 1 === 0 ? val : val.toFixed(1)} Million CAD`;
  }
  if (amount >= 1e3) {
    const val = amount / 1e3;
    return `$${val % 1 === 0 ? val : val.toFixed(1)} Thousand CAD`;
  }
  return `$${amount.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CAD`;
}

/** Formats money in words for top HUD screen (e.g. ₦999 Sextillion, $999 Sextillion CAD) */
export function formatMoneyInWords(amount: number = 0, isCanada: boolean = false): string {
  if (isCanada) return formatCAD(amount);
  return formatNaira(amount);
}

/**
 * Formats complete integer numbers with full digit commas for Naija Pay
 * Handles standard numbers as well as large numbers cleanly without scientific notation
 */
export function formatFullNumberDigits(amount: number = 0): string {
  if (!amount || isNaN(amount)) return '0.00';
  if (amount >= 1e21) {
    // 999 Sextillion representation
    return '999,000,000,000,000,000,000,000.00';
  }
  if (amount >= 1e18) {
    return (BigInt(Math.floor(amount))).toLocaleString();
  }
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
