/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  formatCompactCurrencyFromMinor,
  formatFullMinorDigits,
  majorToMinor,
  parseMinorString,
} from './bigMoney';

export function formatNaira(amount: number): string {
  if (!amount || isNaN(amount)) return '₦0';
  if (amount >= 1e15) {
    return formatCompactCurrencyFromMinor(majorToMinor(amount), 'NGN');
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
  if (amount >= 1e15) {
    return formatCompactCurrencyFromMinor(majorToMinor(amount), 'CAD');
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
 * Formats complete integer numbers with full digit commas using BigInt minor units.
 * Never hardcodes fixed numbers so real deductions from 999 Sextillion reflect in exact digits.
 */
export function formatFullNumberDigits(amount: number | string = 0): string {
  if (amount === undefined || amount === null) return '0.00';
  if (typeof amount === 'string' && /^-?\d+$/.test(amount.trim())) {
    return formatFullMinorDigits(parseMinorString(amount));
  }
  const num = Number(amount);
  if (!num || isNaN(num)) return '0.00';
  if (num >= 1e15) {
    return formatFullMinorDigits(majorToMinor(num));
  }
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatNairaFromKobo(koboStr?: string, fallbackMajor = 0): string {
  const minor = parseMinorString(koboStr, fallbackMajor);
  return formatCompactCurrencyFromMinor(minor, 'NGN');
}

export function formatCadFromCents(centsStr?: string, fallbackMajor = 0): string {
  const minor = parseMinorString(centsStr, fallbackMajor);
  return formatCompactCurrencyFromMinor(minor, 'CAD');
}

export function formatFullDigitsFromMinor(minorStr?: string, fallbackMajor = 0): string {
  const minor = parseMinorString(minorStr, fallbackMajor);
  return formatFullMinorDigits(minor);
}
