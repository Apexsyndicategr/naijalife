/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Authoritative Nigeria (Africa/Lagos, WAT UTC+1) clock utilities for daily scheduled events:
 * - 8:00 PM WAT (20:00): Naija Bet free sports predictions daily settlement
 * - 8:30 PM WAT (20:30): Empire Biz daily profits daily settlement
 */

export interface WatClockSnapshot {
  dateStr: string; // YYYY-MM-DD in Africa/Lagos
  hour: number;    // 0-23 in Africa/Lagos
  minute: number;  // 0-59 in Africa/Lagos
  totalMinutes: number;
}

export function getWatClock(nowMs: number = Date.now()): WatClockSnapshot {
  const d = new Date(nowMs);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '00';
  const dateStr = `${get('year')}-${get('month')}-${get('day')}`;
  let hour = parseInt(get('hour'), 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(get('minute'), 10);
  return {
    dateStr,
    hour,
    minute,
    totalMinutes: hour * 60 + minute,
  };
}

export function shiftWatDate(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return dt.toISOString().slice(0, 10);
}

/**
 * Returns ordered list of eligible WAT settlement dates since `lastSettledDate` up to the
 * most recent passed cutoff (`cutoffHour * 60 + cutoffMinute` WAT).
 */
export function getEligibleWatSettlementDates(params: {
  lastSettledDate?: string;
  createdDate?: string;
  cutoffHour: number;
  cutoffMinute: number;
  nowMs?: number;
  maxBackfillDays?: number;
}): string[] {
  const clock = getWatClock(params.nowMs);
  const cutoffTotalMin = params.cutoffHour * 60 + params.cutoffMinute;
  const latestEligibleDate =
    clock.totalMinutes >= cutoffTotalMin ? clock.dateStr : shiftWatDate(clock.dateStr, -1);

  const baseline = params.lastSettledDate || params.createdDate || shiftWatDate(latestEligibleDate, -1);
  if (baseline >= latestEligibleDate) {
    return [];
  }

  const dates: string[] = [];
  const cap = params.maxBackfillDays ?? 14;
  let cursor = shiftWatDate(baseline, 1);
  let guard = 0;
  while (cursor <= latestEligibleDate && guard < cap) {
    dates.push(cursor);
    cursor = shiftWatDate(cursor, 1);
    guard++;
  }
  return dates;
}
