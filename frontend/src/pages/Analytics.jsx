import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import {
  TrendingUp, Activity, Clock, Zap, Database,
  RefreshCw, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

/**
 * Analytics.jsx
 * Infrastructure telemetry & trend observability page.
 * Design: operational, restrained, Grafana/Datadog-inspired.
 */

// ─── Chart tooltip ──────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const ts = label?.split('T')[1]?.substring(0, 5) ?? label ?? '—';
  return (
    <div className="bg-surface-1 border border-white/[0.08] rounded-lg p-3 shadow-xl">
      <div className="text-2xs font-mono text-slate-600 mb-2 uppercase tracking-widest">{ts}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-2xs font-mono text-slate-500 uppercase">{entry.name}</span>
          <span className="text-2xs font-mono text-slate-300 tabular-nums ml-auto pl-4">
            {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            {entry.name === 'CPU' ? '%' : ' MB'}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Panel card ─────────────────────────────────────────────────────────────
const Panel = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-surface-1 border border-white/[0.06] rounded-xl overflow-hidden ${className}`}>
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
      <div>
        <span className="text-xs font-semibold text-white">{title}</span>
        {subtitle && <span className="text-2xs font-mono text-slate-600 ml-2">{subtitle}</span>}
      </div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// ─── Stat card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color, delta }) => (
  <div className="bg-surface-1 border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className={`p-1.5 rounded-md bg-surface-2 ${color}`}>
        <Icon size={13} />
      </div>
      {delta !== undefined && (
        <span className={`text-2xs font-mono tabular-nums ${delta >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
          {delta >= 0 ? '+' : ''}{delta}%
        </span>
      )}
    </div>
    <div>
      <div className="text-2xs font-mono text-slate-600 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xl font-semibold text-white tabular-nums tracking-tight">{value}</div>
      {sub && <div className="text-2xs font-mono text-slate-700 mt-1">{sub}</div>}
    </div>
  </div>
);

// ─── Common axis/grid props ──────────────────────────────────────────────────
const axisStyle = { fill: '#4b5563', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' };
const gridProps = { strokeDasharray: '3 6', stroke: 'rgba(255,255,255,0.04)', vertical: false };

// ─── Main component ──────────────────────────────────────────────────────────
const Analytics = ({ containers = [] }) => {
  const { api } = useAuth();

  const [range, setRange]                     = useState('24h');
  const [selectedContainer, setSelectedContainer] = useState('global');
  const [trendData, setTrendData]             = useState([]);
  const [summary, setSummary]                 = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [isRefreshing, setIsRefreshing]       = useState(false);
  const [lastFetched, setLastFetched]         = useState(null);

  const fetchAnalytics = async () => {
    setIsRefreshing(true);
    try {
      const trendRes = await api.get('/analytics/trends', {
        params: {
          containerId: selectedContainer === 'global' ? undefined : selectedContainer,
          range,
          interval: range === '1h' ? '1m' : '1h'
        }
      });
      if (trendRes.data.success) setTrendData(trendRes.data.data);

      if (selectedContainer !== 'global') {
        const summaryRes = await api.get(`/analytics/summary/${selectedContainer}`, { params: { range } });
        if (summaryRes.data.success) setSummary(summaryRes.data.summary);
      } else {
        const td = trendRes.data.data ?? [];
        const avgCpu = td.reduce((a, c) => a + c.cpu, 0) / (td.length || 1);
        const avgMem = td.reduce((a, c) => a + c.memory, 0) / (td.length || 1);
        setSummary({ avgCpu: avgCpu.toFixed(2), avgMem: avgMem.toFixed(2), uptimePercentage: 100, dataPoints: td.length });
      }
      setLastFetched(new Date());
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [range, selectedContainer]);

  const uptimePct  = parseFloat(summary?.uptimePercentage ?? 100);
  const pieData    = [
    { name: 'Uptime',   value: uptimePct },
    { name: 'Downtime', value: Math.max(0, 100 - uptimePct) }
  ];

  const fmtTs = (t) => t?.split('T')[1]?.substring(0, 5) ?? t ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-5 pb-16"
    >
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 bg-accent-blue/10 text-accent-blue text-2xs font-semibold rounded border border-accent-blue/20 uppercase tracking-widest">
              Analytics
            </span>
            <span className="text-slate-600 text-2xs font-mono">/ telemetry</span>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Resource Telemetry</h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Container selector */}
          <div className="flex items-center gap-1.5 bg-surface-1 border border-white/[0.06] rounded-md px-2 py-1.5">
            <Filter size={11} className="text-slate-600" />
            <select
              value={selectedContainer}
              onChange={e => setSelectedContainer(e.target.value)}
              className="bg-transparent border-none outline-none text-2xs font-mono text-slate-400 cursor-pointer"
            >
              <option value="global">global</option>
              {containers.map(c => (
                <option key={c.Id} value={c.Id}>{c.Names[0].replace('/', '')}</option>
              ))}
            </select>
          </div>

          {/* Range selector */}
          <div className="flex items-center gap-0.5 bg-surface-1 border border-white/[0.06] rounded-md p-0.5">
            {['1h', '24h', '7d', '30d'].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded text-2xs font-mono tracking-wide transition-all duration-100 ${
                  range === r ? 'bg-accent-blue/15 text-accent-blue' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchAnalytics}
            disabled={isRefreshing}
            className="p-1.5 bg-surface-1 border border-white/[0.06] rounded-md text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Metadata strip */}
      <div className="flex items-center gap-0 border border-white/[0.06] rounded-lg bg-surface-1/50 divide-x divide-white/[0.06] overflow-hidden w-fit">
        {[
          { k: 'Scope',    v: selectedContainer === 'global' ? 'global' : containers.find(c => c.Id === selectedContainer)?.Names[0]?.replace('/', '') ?? selectedContainer },
          { k: 'Range',    v: range },
          { k: 'Interval', v: range === '1h' ? '1 min' : '1 hr' },
          { k: 'Snapshots',v: summary?.dataPoints ?? '—' },
          { k: 'Updated',  v: lastFetched ? lastFetched.toLocaleTimeString() : '—' },
        ].map(({ k, v }) => (
          <div key={k} className="px-3 py-1.5 flex items-center gap-2">
            <span className="text-2xs text-slate-600 font-mono uppercase">{k}</span>
            <span className="text-2xs text-slate-400 font-mono tabular-nums">{v}</span>
          </div>
        ))}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Avg CPU"
          value={`${summary?.avgCpu ?? 0}%`}
          sub="rolling average"
          icon={Zap}
          color="text-accent-cyan"
        />
        <StatCard
          label="Peak Memory"
          value={`${summary?.peakMem ?? summary?.avgMem ?? 0} MB`}
          sub="max threshold"
          icon={Database}
          color="text-purple-400"
        />
        <StatCard
          label="Availability"
          value={`${summary?.uptimePercentage ?? 0}%`}
          sub="uptime score"
          icon={Activity}
          color="text-accent-green"
        />
        <StatCard
          label="Snapshots"
          value={summary?.dataPoints ?? 0}
          sub={`captured · ${range}`}
          icon={Clock}
          color="text-amber-400"
        />
      </div>

      {/* ── Section label ── */}
      <div className="flex items-center gap-3">
        <span className="text-2xs font-mono text-slate-600 uppercase tracking-widest">Resource Utilization</span>
        <div className="flex-1 h-px bg-white/[0.05]" />
        <span className="text-2xs font-mono text-slate-700">{range} window · {trendData.length} pts</span>
      </div>

      {/* ── Area chart ── */}
      <Panel title="CPU & Memory Trend" subtitle={`last ${range}`}>
        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <span className="text-2xs font-mono text-slate-600 animate-pulse">loading telemetry…</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#22d3ee" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#a78bfa" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis
                  dataKey="timestamp"
                  axisLine={false}
                  tickLine={false}
                  tick={axisStyle}
                  tickFormatter={fmtTs}
                  interval="preserveStartEnd"
                />
                <YAxis axisLine={false} tickLine={false} tick={axisStyle} width={36} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
                <Area
                  name="CPU"
                  type="monotone"
                  dataKey="cpu"
                  stroke="#22d3ee"
                  strokeWidth={1.5}
                  fill="url(#gradCpu)"
                  dot={false}
                  activeDot={{ r: 3, fill: '#22d3ee', strokeWidth: 0 }}
                  animationDuration={800}
                />
                <Area
                  name="Memory"
                  type="monotone"
                  dataKey="memory"
                  stroke="#a78bfa"
                  strokeWidth={1.5}
                  fill="url(#gradMem)"
                  dot={false}
                  activeDot={{ r: 3, fill: '#a78bfa', strokeWidth: 0 }}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Chart legend */}
        <div className="flex items-center gap-5 mt-3 pt-3 border-t border-white/[0.04]">
          {[
            { label: 'CPU Load',  color: '#22d3ee' },
            { label: 'Memory',    color: '#a78bfa' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-4 h-px inline-block rounded-full" style={{ backgroundColor: color, opacity: 0.7 }} />
              <span className="text-2xs font-mono text-slate-600">{label}</span>
            </div>
          ))}
          <span className="ml-auto text-2xs font-mono text-slate-700">interval: {range === '1h' ? '1 min' : '1 hr'}</span>
        </div>
      </Panel>

      {/* ── Secondary charts ── */}
      <div className="flex items-center gap-3">
        <span className="text-2xs font-mono text-slate-600 uppercase tracking-widest">Distribution & Availability</span>
        <div className="flex-1 h-px bg-white/[0.05]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Availability donut */}
        <Panel title="Availability" subtitle="uptime breakdown">
          <div className="relative flex items-center justify-center h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  animationDuration={700}
                >
                  <Cell fill="#22c55e" stroke="none" />
                  <Cell fill="#1f1f26" stroke="none" />
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-surface-1 border border-white/[0.08] rounded-lg px-3 py-2">
                        <span className="text-2xs font-mono text-slate-400">{payload[0].name}: </span>
                        <span className="text-2xs font-mono text-white tabular-nums">{payload[0].value.toFixed(1)}%</span>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-2xl font-semibold text-white tabular-nums">{uptimePct.toFixed(1)}%</span>
              <span className="text-2xs font-mono text-slate-600 mt-0.5">availability</span>
            </div>
          </div>

          <div className="flex justify-center gap-6 pt-3 border-t border-white/[0.04]">
            {[
              { label: 'Uptime',   color: '#22c55e' },
              { label: 'Downtime', color: '#374151' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-2xs font-mono text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* CPU distribution bar chart */}
        <Panel title="CPU Distribution" subtitle="last 10 snapshots">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData.slice(-10)} margin={{ top: 4, right: 4, bottom: 0, left: -16 }} barSize={14}>
                <CartesianGrid {...gridProps} />
                <XAxis hide />
                <YAxis axisLine={false} tickLine={false} tick={axisStyle} width={36} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="cpu" name="CPU" radius={[2, 2, 0, 0]} animationDuration={600}>
                  {trendData.slice(-10).map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.cpu > 15 ? '#f43f5e' : '#3b82f6'}
                      opacity={0.55}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-2xs font-mono text-slate-700 mt-3 pt-3 border-t border-white/[0.04]">
            red bars indicate cpu &gt; 15% threshold · 10-sample window
          </p>
        </Panel>
      </div>
    </motion.div>
  );
};

export default Analytics;
