"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  supply: string;
  vwap24Hr: string;
}

function fmtNum(n: number) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  return n.toLocaleString();
}

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch("https://api.coincap.io/v2/assets?limit=20");
        const data = await res.json();
        setAssets(data.data);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
    fetchAssets();
  }, []);

  const totalMcap = assets.reduce((s, a) => s + parseFloat(a.marketCapUsd || "0"), 0);
  const avgChange = assets.reduce((s, a) => s + parseFloat(a.changePercent24Hr || "0"), 0) / (assets.length || 1);
  const best = assets.reduce((b, a) => parseFloat(a.changePercent24Hr || "0") > parseFloat(b.changePercent24Hr || "0") ? a : b, assets[0]);
  const maxMcap = Math.max(...assets.map((a) => parseFloat(a.marketCapUsd || "0")), 1);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-200">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-950/15 via-[#0a0e1a] to-blue-950/10" />

      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="border-b border-white/5 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">CoinFolio</h1>
            <p className="text-xs text-slate-500 mt-1">Real-time crypto portfolio tracker | CoinCap API v3</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-sm">+ Add Asset</button>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 mb-8">
          <p className="text-xs text-slate-500">Total Market Cap (Top 20)</p>
          <p className="text-4xl font-extrabold mt-2 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">${fmtNum(totalMcap)}</p>
          <p className={`text-sm font-semibold mt-2 ${avgChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}% avg 24h change
          </p>
          <div className="flex gap-8 mt-4">
            <div><p className="text-lg font-bold text-emerald-400">{assets.length}</p><p className="text-[10px] text-slate-500">Assets Tracked</p></div>
            <div><p className="text-lg font-bold text-blue-400">{best?.symbol || "--"}</p><p className="text-[10px] text-slate-500">Best 24h</p></div>
            <div><p className="text-lg font-bold text-amber-400">{parseFloat(best?.changePercent24Hr || "0").toFixed(2)}%</p><p className="text-[10px] text-slate-500">Top Gainer</p></div>
          </div>
        </motion.div>

        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-emerald-400 to-blue-500 rounded-full" />
          Live Market Data
        </h2>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading assets...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["#", "Asset", "Price", "24h Change", "Market Cap", "Volume (24h)", "Supply", "Dominance"].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-[11px] text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assets.map((a, i) => {
                  const price = parseFloat(a.priceUsd || "0");
                  const change = parseFloat(a.changePercent24Hr || "0");
                  const mcap = parseFloat(a.marketCapUsd || "0");
                  const vol = parseFloat(a.volumeUsd24Hr || "0");
                  const sup = parseFloat(a.supply || "0");
                  const dom = (mcap / totalMcap) * 100;
                  return (
                    <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="py-3 px-3 text-slate-500 text-sm">{i + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold">{a.symbol.substring(0, 2)}</div>
                          <div><p className="font-semibold text-sm">{a.name}</p><p className="text-xs text-slate-500">{a.symbol}</p></div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-sm">${price >= 1 ? price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : price.toFixed(6)}</td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className={`text-xs ${change >= 0 ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10" : "text-red-400 border-red-400/20 bg-red-400/10"}`}>
                          {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-sm">${fmtNum(mcap)}</td>
                      <td className="py-3 px-3 text-slate-400 text-sm">${fmtNum(vol)}</td>
                      <td className="py-3 px-3 text-slate-400 text-sm">{fmtNum(sup)} {a.symbol}</td>
                      <td className="py-3 px-3">
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" style={{ width: `${(mcap / maxMcap) * 100}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{dom.toFixed(2)}%</p>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-xs text-slate-600 border-t border-white/5">
        CoinFolio &copy; 2026 | Real-time data from CoinCap API v3 (Free) | Built with Next.js + shadcn/ui
      </footer>
    </div>
  );
}
