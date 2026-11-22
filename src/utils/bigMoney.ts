/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Exact arbitrary-precision integer minor-unit currency utilities (kobo for NGN, cents for CAD).
 * Eliminates IEEE-754 float64 precision loss above Number.MAX_SAFE_INTEGER (9.007e15),
 * allowing exact ₦1 / $0.01 debits & credits even from 999 Sextillion (9.99e23).
 */

export const OWNER_INITIAL_NGN_KOBO = '99900000000000000000000000'; // 999 Sextillion NGN * 100 kobo
export const OWNER_INITIAL_CAD_CENTS = '99900000000000000000000000'; // 999 Sextillion CAD * 100 cents

const DIGIT_RE = /^-?\d+$/;

/**
 * Expands a number or decimal string (including scientific notation like "9.99e+23")
 * into exact BigInt minor units (10^-2, i.e., kobo or cents).
 */
export function majorToMinor(value: number | string | bigint | undefined | null): bigint {
  if (value === undefined || value === null) return 0n;
  if (typeof value === 'bigint') return value * 100n;

  let raw = typeof value === 'number' ? String(value) : value.trim();
  if (!raw || raw === 'NaN' || raw === 'Infinity' || raw === '-Infinity') return 0n;

  raw = raw.replace(/,/g, '');
  let neg = false;
  if (raw.startsWith('-')) {
    neg = true;
    raw = raw.slice(1);
  } else if (raw.startsWith('+')) {
    raw = raw.slice(1);
  }

  // Handle scientific notation e.g. 9.99e23 or 9.99e+23
  const sciMatch = raw.match(/^(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/);
  let intPart = '0';
  let fracPart = '';

  if (sciMatch) {
    const whole = sciMatch[1] || '0';
    const dec = sciMatch[2] || '';
    const exp = parseInt(sciMatch[3], 10);
    const digits = whole + dec;
    const newDotPos = whole.length + exp;
    if (newDotPos <= 0) {
      intPart = '0';
      fracPart = '0'.repeat(-newDotPos) + digits;
    } else if (newDotPos >= digits.length) {
      intPart = digits + '0'.repeat(newDotPos - digits.length);
      fracPart = '';
    } else {
      intPart = digits.slice(0, newDotPos);
      fracPart = digits.slice(newDotPos);
    }
  } else {
    const parts = raw.split('.');
    intPart = (parts[0] || '0').replace(/\D/g, '') || '0';
    fracPart = (parts[1] || '').replace(/\D/g, '');
  }

  const paddedFrac = (fracPart + '00').slice(0, 2);
  const absMinor = BigInt(intPart + paddedFrac);
  return neg ? -absMinor : absMinor;
}

export function parseMinorString(minorStr: string | number | bigint | undefined | null, fallbackMajor?: number): bigint {
  if (typeof minorStr === 'bigint') return minorStr;
  if (typeof minorStr === 'string') {
    const trimmed = minorStr.trim();
    if (trimmed && DIGIT_RE.test(trimmed)) {
      return BigInt(trimmed);
    }
  }
  if (fallbackMajor !== undefined) {
    return majorToMinor(fallbackMajor);
  }
  return 0n;
}

export function minorToMajorNumber(minor: bigint | string): number {
  const bi = typeof minor === 'bigint' ? minor : parseMinorString(minor);
  const whole = bi / 100n;
  const rem = bi % 100n;
  return Number(whole) + Number(rem) / 100;
}

export function minorToDecimalString(minor: bigint | string): string {
  const bi = typeof minor === 'bigint' ? minor : parseMinorString(minor);
  const neg = bi < 0n;
  const abs = neg ? -bi : bi;
  const whole = abs / 100n;
  const cents = (abs % 100n).toString().padStart(2, '0');
  return `${neg ? '-' : ''}${whole.toString()}.${cents}`;
}

export function formatFullMinorDigits(input: bigint | string | number | undefined | null): string {
  const bi =
    typeof input === 'bigint'
      ? input
      : typeof input === 'string' && DIGIT_RE.test(input.trim())
      ? BigInt(input.trim())
      : majorToMinor(input);

  const neg = bi < 0n;
  const abs = neg ? -bi : bi;
  const wholeStr = (abs / 100n).toString();
  const centsStr = (abs % 100n).toString().padStart(2, '0');
  const grouped = wholeStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '-' : ''}${grouped}.${centsStr}`;
}

export function formatCompactCurrencyFromMinor(
  input: bigint | string | number | undefined | null,
  currency: 'NGN' | 'CAD'
): string {
  const bi =
    typeof input === 'bigint'
      ? input
      : typeof input === 'string' && DIGIT_RE.test(input.trim())
      ? BigInt(input.trim())
      : majorToMinor(input);

  const abs = bi < 0n ? -bi : bi;
  const sign = bi < 0n ? '-' : '';
  const prefix = currency === 'CAD' ? '$' : '₦';
  const suffix = currency === 'CAD' ? ' CAD' : '';

  const scales: Array<{ threshold: bigint; label: string }> = [
    { threshold: 10n ** 26n, label: 'Septillion' }, // 10^24 major * 100 minor
    { threshold: 10n ** 23n, label: 'Sextillion' }, // 10^21 major * 100 minor
    { threshold: 10n ** 20n, label: 'Quintillion' }, // 10^18 major * 100 minor
    { threshold: 10n ** 17n, label: 'Quadrillion' },
    { threshold: 10n ** 14n, label: 'Trillion' },
    { threshold: 10n ** 11n, label: 'Billion' },
    { threshold: 10n ** 8n, label: 'Million' },
    { threshold: 10n ** 5n, label: 'Thousand' },
  ];

  for (const s of scales) {
    if (abs >= s.threshold) {
      // Scale to 2 decimals for compact word readout while avoiding rounding up 998.999 to 999
      const scaledTenths = (abs * 10n) / s.threshold;
      const whole = scaledTenths / 10n;
      const dec = scaledTenths % 10n;
      const numStr = dec === 0n ? whole.toString() : `${whole.toString()}.${dec.toString()}`;
      return `${sign}${prefix}${numStr} ${s.label}${suffix}`;
    }
  }

  const wholeMajor = (abs / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const cents = (abs % 100n).toString().padStart(2, '0');
  if (currency === 'CAD') {
    return `${sign}$${wholeMajor}.${cents} CAD`;
  }
  return `${sign}₦${wholeMajor}${cents !== '00' ? `.${cents}` : ''}`;
}

export function addMinorUnits(base: string | bigint, delta: bigint): string {
  const b = typeof base === 'bigint' ? base : parseMinorString(base);
  const next = b + delta;
  if (next < 0n) {
    throw new Error('Balance cannot be negative.');
  }
  return next.toString();
}

export function subtractMinorUnits(base: string | bigint, debit: bigint): string {
  if (debit < 0n) throw new Error('Debit amount cannot be negative.');
  const b = typeof base === 'bigint' ? base : parseMinorString(base);
  if (b < debit) {
    throw new Error('Insufficient balance.');
  }
  return (b - debit).toString();
}

/**
 * Exact BigInt FX conversion from NGN kobo -> CAD cents.
 * Formula: cadCents = floor((ngnKobo * 100 * spreadBps) / (rateKoboPerCad * 10000))
 */
export function computeFxNgnToCad(
  ngnKobo: bigint,
  cadToNgnRate = 960.54,
  spread = 0.992
): {
  creditCadCents: bigint;
  feeKobo: bigint;
  effectiveRate: number;
} {
  if (ngnKobo <= 0n) {
    return { creditCadCents: 0n, feeKobo: 0n, effectiveRate: cadToNgnRate };
  }
  const rateScaled = BigInt(Math.round(cadToNgnRate * 100)); // e.g. 96054n
  const spreadBps = BigInt(Math.round(spread * 10000)); // e.g. 9920n
  const grossCreditCadCents = (ngnKobo * 100n) / rateScaled;
  const creditCadCents = (ngnKobo * 100n * spreadBps) / (rateScaled * 10000n);
  const feeCadCents = grossCreditCadCents - creditCadCents;
  const feeKobo = (feeCadCents * rateScaled) / 100n;
  return {
    creditCadCents,
    feeKobo,
    effectiveRate: cadToNgnRate,
  };
}

/**
 * Exact BigInt FX conversion from CAD cents -> NGN kobo.
 * Formula: ngnKobo = floor((cadCents * rateScaled) / 100)
 */
export function computeFxCadToNgn(
  cadCents: bigint,
  cadToNgnRate = 960.54
): {
  creditNgnKobo: bigint;
  effectiveRate: number;
} {
  if (cadCents <= 0n) {
    return { creditNgnKobo: 0n, effectiveRate: cadToNgnRate };
  }
  const rateScaled = BigInt(Math.round(cadToNgnRate * 100)); // 96054n
  const creditNgnKobo = (cadCents * rateScaled) / 100n;
  return {
    creditNgnKobo,
    effectiveRate: cadToNgnRate,
  };
}
