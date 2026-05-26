"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Coins,
  Trophy,
} from "lucide-react";

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

function fmtNum(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  return n.toLocaleString();
}

function fmtPrice(n: number): string {
  if (n >= 1) return "$" + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n >= 0.01) return "$" + n.toFixed(4);
  return "$" + n.toFixed(6);
}

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.coincap.io/v2/assets?limit=20");
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setAssets(data.data);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Failed to fetch assets. Try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const totalMcap = assets.reduce(
    (s, a) => s + parseFloat(a.marketCapUsd || "0"),
    0
  );
  const avgChange =
    assets.reduce(
      (s, a) => s + parseFloat(a.changePercent24Hr || "0"),
      0
    ) / (assets.length || 1);
  const best = assets.reduce(
    (b, a) =>
      parseFloat(a.changePercent24Hr || "0") >
      parseFloat(b.changePercent24Hr || "0")
        ? a
        : b,
    assets[0]
  );
  const maxMcap = Math.max(
    ...assets.map((a) => parseFloat(a.marketCapUsd || "0")),
    1
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-slate-200">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-950/15 via-[var(--background)] to-blue-950/10" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              CoinFolio
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              Real-time crypto portfolio tracker
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssets}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </motion.header>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3"
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 mb-8"
        >
          <p className="text-xs text-slate-500">Total Market Cap (Top 20)</p>
          <p className="text-3xl sm:text-4xl font-extrabold mt-2 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            {loading ? "--" : "$" + fmtNum(totalMcap)}
          </p>
          {!loading && (
            <p
              className={`text-sm font-semibold mt-2 ${
                avgChange >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {avgChange >= 0 ? "+" : ""}
              {avgChange.toFixed(2)}% avg 24h change
            </p>
          )}
          <div className="flex flex-wrap gap-6 sm:gap-8 mt-4">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="text-lg font-bold text-emerald-400">
                  {assets.length}
                </p>
                <p className="text-[10px] text-slate-500">Assets Tracked</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-blue-400" />
              <div>
                <p className="text-lg font-bold text-blue-400">
                  {best?.symbol || "--"}
                </p>
                <p className="text-[10px] text-slate-500">Best 24h</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-400" />
              <div>
                <p className="text-lg font-bold text-amber-400">
                  {best
                    ? parseFloat(best.changePercent24Hr).toFixed(2) + "%"
                    : "--"}
                </p>
                <p className="text-[10px] text-slate-500">Top Gainer</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-emerald-400 to-blue-500 rounded-full" />
          Live Market Data
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-10 text-slate-500">#</TableHead>
                <TableHead className="text-slate-500">Asset</TableHead>
                <TableHead className="text-slate-500 text-right">
                  Price
                </TableHead>
                <TableHead className="text-slate-500 text-right">
                  24h Change
                </TableHead>
                <TableHead className="text-slate-500 text-right hidden sm:table-cell">
                  Market Cap
                </TableHead>
                <TableHead className="text-slate-500 text-right hidden md:table-cell">
                  Volume (24h)
                </TableHead>
                <TableHead className="text-slate-500 text-right hidden lg:table-cell">
                  Supply
                </TableHead>
                <TableHead className="text-slate-500 text-right hidden lg:table-cell">
                  Dominance
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((a) => {
                const price = parseFloat(a.priceUsd || "0");
                const change = parseFloat(a.changePercent24Hr || "0");
                const mcap = parseFloat(a.marketCapUsd || "0");
                const vol = parseFloat(a.volumeUsd24Hr || "0");
                const sup = parseFloat(a.supply || "0");
                const dom = totalMcap > 0 ? (mcap / totalMcap) * 100 : 0;
                const positive = change >= 0;

                return (
                  <TableRow
                    key={a.id}
                    className="border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <TableCell className="text-slate-500 text-sm">
                      {assets.indexOf(a) + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-emerald-400">
                          {a.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-tight">
                            {a.name}
                          </p>
                          <p className="text-xs text-slate-500">{a.symbol}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      {fmtPrice(price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          positive
                            ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10 text-xs gap-0.5"
                            : "text-red-400 border-red-400/20 bg-red-400/10 text-xs gap-0.5"
                        }
                      >
                        {positive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(change).toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-slate-400 text-sm hidden sm:table-cell">
                      ${fmtNum(mcap)}
                    </TableCell>
                    <TableCell className="text-right text-slate-400 text-sm hidden md:table-cell">
                      ${fmtNum(vol)}
                    </TableCell>
                    <TableCell className="text-right text-slate-400 text-sm hidden lg:table-cell">
                      {fmtNum(sup)} {a.symbol}
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden ml-auto">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                          style={{
                            width: `${(mcap / maxMcap) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {dom.toFixed(2)}%
                      </p>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-xs text-slate-600 border-t border-white/5">
        CoinFolio &copy; 2026 &middot; Data from CoinCap API &middot; Built
        with Next.js + shadcn/ui
      </footer>
    </div>
  );
}
