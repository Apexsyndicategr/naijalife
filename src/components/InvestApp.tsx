/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, RefreshCw, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { UserProfile } from '../types/game';
import { formatNaira, formatCAD } from '../utils/formatNaira';
import { getAuthBearerHeaders } from '../services/economyService';

export interface InvestAppProps {
  userProfile?: UserProfile;
  currentStateId?: string;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onShowToast?: (msg: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

interface MarketAsset {
  symbol: string;
  name: string;
  market: 'NGX' | 'TSX' | 'FX';
  currency: 'NGN' | 'CAD';
  basePrice: number;
  currentPrice: number;
  desc: string;
  series: Array<{ t: string; price: number }>;
}

interface Holding {
  symbol: string;
  currency: 'NGN' | 'CAD';
  quantity: number;
  avgCost: number;
  realizedPnl: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
}

interface MarketOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  unitPrice: number;
  totalMajor: number;
  currency: 'NGN' | 'CAD';
  pnlMajor?: number;
  timestamp: number;
}

function PriceSparkline({ points, positive }: { points: number[]; positive: boolean }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const w = 140;
  const h = 42;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / span) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const stroke = positive ? '#34d399' : '#fb7185';
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-11 overflow-visible">
      <polyline fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={coords} />
    </svg>
  );
}

function getChangePct(asset: MarketAsset): number {
  const first = asset.series?.[0]?.price || asset.basePrice || asset.currentPrice;
  if (!first) return 0;
  return Number((((asset.currentPrice - first) / first) * 100).toFixed(2));
}

export const InvestApp: React.FC<InvestAppProps> = ({
  userProfile,
  onUpdateProfile,
  onShowToast,
  triggerSound,
}) => {
  const [tab, setTab] = useState<'markets' | 'portfolio' | 'orders'>('markets');
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'NGX' | 'TSX' | 'FX'>('ALL');
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [orders, setOrders] = useState<MarketOrder[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('MTNN');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [qtyInput, setQtyInput] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadMarket = useCallback(async () => {
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/invest/snapshot', { headers });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setAssets(Array.isArray(data.quotes) ? data.quotes : []);
        setHoldings(Array.isArray(data.holdings) ? data.holdings : []);
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarket();
    const timer = window.setInterval(loadMarket, 20000);
    return () => window.clearInterval(timer);
  }, [loadMarket]);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.symbol === selectedSymbol) || assets[0] || null,
    [assets, selectedSymbol]
  );

  const holdingsBySymbol = useMemo(() => {
    const map: Record<string, Holding> = {};
    for (const h of holdings) map[h.symbol] = h;
    return map;
  }, [holdings]);

  const handleOrder = async () => {
    if (!selectedAsset) return;
    if (!Number.isFinite(qtyInput) || qtyInput <= 0) {
      onShowToast?.('Enter a positive share quantity.');
      return;
    }
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/invest/trade', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          symbol: selectedAsset.symbol,
          side: orderSide,
          quantity: qtyInput,
          requestId: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Order rejected.');
        triggerSound?.('alert');
        return;
      }
      if (data.account && userProfile && onUpdateProfile) {
        onUpdateProfile({
          ...userProfile,
          ngnKobo: data.account.ngnKobo,
          cadCents: data.account.cadCents,
          bankNaira: data.account.bankNaira,
          cashNaira: data.account.cashNaira ?? 0,
          bankCAD: data.account.bankCAD,
          receipts: data.account.receipts,
        });
      }
      if (data.snapshot) {
        setAssets(data.snapshot.quotes || []);
        setHoldings(data.snapshot.holdings || []);
        setOrders(data.snapshot.orders || []);
      }
      onShowToast?.(
        `${orderSide === 'buy' ? 'Bought' : 'Sold'} ${qtyInput} ${selectedAsset.symbol} @ ${
          selectedAsset.currency === 'CAD' ? formatCAD(selectedAsset.currentPrice) : formatNaira(selectedAsset.currentPrice)
        }`
      );
      triggerSound?.('coin');
    } finally {
      setBusy(false);
    }
  };

  const filteredAssets = assets.filter((a) => marketFilter === 'ALL' || a.market === marketFilter);
  const holdingsList = holdings.filter((h) => h.quantity > 0 || h.realizedPnl !== 0);

  return (
    <div className="space-y-3">
      {/* Simulated Trading Disclosure */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-zinc-950 to-black border border-cyan-500/40 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-cyan-200 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Naija &amp; Toronto Markets</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-[9px] font-mono font-black">
            SIMULATED EXCHANGE
          </span>
        </div>
        <p className="text-[10px] text-zinc-400 flex items-center gap-1">
          <Info className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>Simulated virtual market &amp; forex trading for in-game NGN/CAD balances only.</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px] font-bold">
        {[
          { id: 'markets', label: 'Markets & Charts' },
          { id: 'portfolio', label: `Portfolio (${holdingsList.length})` },
          { id: 'orders', label: 'Order History' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`py-1.5 rounded-lg cursor-pointer ${
              tab === t.id ? 'bg-cyan-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-10 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading market feed...
        </div>
      )}

      {!loading && tab === 'markets' && (
        <div className="space-y-3">
          {/* Selected Asset Chart & Order Box */}
          {selectedAsset && (() => {
            const changePct = getChangePct(selectedAsset);
            const seriesNums = (selectedAsset.series || []).map((pt) => pt.price);
            return (
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-cyan-500/30 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-black text-white">
                      {selectedAsset.symbol} · {selectedAsset.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">{selectedAsset.market} ({selectedAsset.currency})</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-black text-white">
                      {selectedAsset.currency === 'CAD' ? formatCAD(selectedAsset.currentPrice) : formatNaira(selectedAsset.currentPrice)}
                    </div>
                    <div className={`text-[10px] font-mono font-bold flex items-center justify-end ${changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {changePct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {changePct >= 0 ? '+' : ''}
                      {changePct}%
                    </div>
                  </div>
                </div>

                <PriceSparkline points={seriesNums} positive={changePct >= 0} />

                <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-xl text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setOrderSide('buy')}
                    className={`py-1 rounded-lg cursor-pointer ${orderSide === 'buy' ? 'bg-emerald-500 text-black font-black' : 'text-zinc-400'}`}
                  >
                    BUY {selectedAsset.symbol}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderSide('sell')}
                    className={`py-1 rounded-lg cursor-pointer ${orderSide === 'sell' ? 'bg-rose-500 text-white font-black' : 'text-zinc-400'}`}
                  >
                    SELL ({holdingsBySymbol[selectedAsset.symbol]?.quantity || 0} owned)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    step="any"
                    value={qtyInput}
                    onChange={(e) => setQtyInput(Number(e.target.value))}
                    className="w-24 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleOrder}
                    className={`flex-1 py-2 rounded-xl font-black text-xs cursor-pointer ${
                      orderSide === 'buy' ? 'bg-emerald-500 text-black' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {orderSide === 'buy' ? 'Buy' : 'Sell'}{' '}
                    {selectedAsset.currency === 'CAD'
                      ? formatCAD(qtyInput * selectedAsset.currentPrice)
                      : formatNaira(qtyInput * selectedAsset.currentPrice)}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Exchange Filters */}
          <div className="flex gap-1.5">
            {(['ALL', 'NGX', 'TSX', 'FX'] as const).map((mf) => (
              <button
                key={mf}
                type="button"
                onClick={() => setMarketFilter(mf)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                  marketFilter === mf ? 'bg-cyan-500 text-black font-black' : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                {mf}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            {filteredAssets.map((a) => {
              const changePct = getChangePct(a);
              return (
                <div
                  key={a.symbol}
                  onClick={() => setSelectedSymbol(a.symbol)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                    selectedAsset?.symbol === a.symbol
                      ? 'bg-cyan-950/30 border-cyan-400/60'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div>
                    <div className="text-xs font-black text-white">
                      {a.symbol} <span className="text-[9px] text-zinc-400 font-mono">({a.market})</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">{a.name}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-white">
                      {a.currency === 'CAD' ? formatCAD(a.currentPrice) : formatNaira(a.currentPrice)}
                    </div>
                    <div className={`text-[10px] ${changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {changePct >= 0 ? '+' : ''}
                      {changePct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PORTFOLIO & P&L */}
      {!loading && tab === 'portfolio' && (
        <div className="space-y-2">
          {holdingsList.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-950 border border-zinc-800">
              No active positions. Buy NGX, TSX, or FX assets to build your portfolio!
            </div>
          ) : (
            holdingsList.map((h) => {
              const fmt = (n: number) => (h.currency === 'CAD' ? formatCAD(n) : formatNaira(n));
              return (
                <div key={h.symbol} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white">
                      {h.symbol} · {h.quantity} units
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSymbol(h.symbol);
                        setOrderSide('sell');
                        setQtyInput(Math.max(1, h.quantity));
                        setTab('markets');
                      }}
                      className="px-2 py-0.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold cursor-pointer"
                    >
                      Trade
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-zinc-400">
                    <span>Avg: {fmt(h.avgCost)}</span>
                    <span className={h.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      Unreal: {h.unrealizedPnl >= 0 ? '+' : ''}{fmt(h.unrealizedPnl)}
                    </span>
                    <span className={h.realizedPnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                      Realized: {fmt(h.realizedPnl)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: ORDER HISTORY */}
      {!loading && tab === 'orders' && (
        <div className="space-y-1.5">
          {orders.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-950 border border-zinc-800">
              No market orders executed yet.
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-white uppercase">
                    {o.side} {o.quantity} {o.symbol}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    {new Date(o.timestamp).toLocaleString()}
                  </div>
                </div>
                <span className="font-mono font-bold text-cyan-300">
                  {o.currency === 'CAD' ? formatCAD(o.totalMajor) : formatNaira(o.totalMajor)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
