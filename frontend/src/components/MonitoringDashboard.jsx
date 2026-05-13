import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine,
  ComposedChart, Line
} from 'recharts';
import { Cpu, Database, Activity, Wifi } from 'lucide-react';

/**
 * MonitoringDashboard.jsx
 * Telemetry charts with Grafana-style axis labels, reference lines,
 * and compact metadata rows.
 */

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-white/[0.08] rounded-md px-3 py-2 text-2xs shadow-lg">
      <p className="font-mono text-slate-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400 capitalize">{p.name}:</span>
          <span className="font-mono text-white">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{p.name === 'cpu' ? '%' : p.name === 'memory' ? 'MB' : ''}</span>
        </div>
      ))}
    </div>
  );
};

const MetaRow = ({ label, value, accent = 'text-slate-300' }) => (
  <div className="flex items-center justify-between py-1 border-b border-white/[0.04] last:border-0">
    <span className="text-2xs text-slate-600 font-mono uppercase">{label}</span>
    <span className={`text-2xs font-mono font-medium ${accent} tabular-nums`}>{value}</span>
  </div>
);

const MonitoringDashboard = ({ data = [] }) => {
  const latest = data[data.length - 1] || {};
  const cpuValues = data.map(d => d.cpu || 0).filter(Boolean);
  const memValues = data.map(d => d.memory || 0).filter(Boolean);
  const avgCpu = cpuValues.length ? (cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length).toFixed(1) : '—';
  const peakCpu = cpuValues.length ? Math.max(...cpuValues).toFixed(1) : '—';
  const avgMem = memValues.length ? (memValues.reduce((a, b) => a + b, 0) / memValues.length).toFixed(0) : '—';

  return (
    <div className="space-y-3">
      
      {/* === PRIMARY: CPU + Memory combined === */}
      <div className="card p-0 overflow-hidden">
        {/* Chart header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <Cpu size={13} className="text-slate-500" />
            <span className="text-xs font-medium text-white">Resource Utilization</span>
            <span className="text-2xs font-mono text-slate-600">— rolling 20 samples</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-accent-blue rounded" />
              <span className="text-2xs text-slate-500">CPU</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-accent-purple rounded" />
              <span className="text-2xs text-slate-500">MEM</span>
            </div>
            <div className="h-3 w-px bg-white/[0.06]" />
            <span className="font-mono text-xs text-accent-blue font-medium tabular-nums">
              {latest.cpu != null ? `${latest.cpu.toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[180px] w-full px-2 pt-3 pb-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="rgba(255,255,255,0.04)" 
                vertical={false} 
              />
              {/* Warning threshold */}
              <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.4} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 9, fill: '#4b4d59', fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                tickCount={5}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: '#4b4d59', fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}%`}
                width={32}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
              <Area 
                type="monotone" dataKey="cpu" name="cpu"
                stroke="#3b82f6" strokeWidth={1.5}
                fill="url(#gradCpu)" isAnimationActive={false}
              />
              <Line 
                type="monotone" dataKey="memory" name="memory"
                stroke="#a78bfa" strokeWidth={1.5} dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Inline stats footer */}
        <div className="flex divide-x divide-white/[0.05] border-t border-white/[0.05]">
          {[
            { label: 'cpu now',  value: latest.cpu != null ? `${latest.cpu.toFixed(1)}%` : '—', accent: 'text-accent-blue' },
            { label: 'cpu avg',  value: `${avgCpu}%`,  accent: 'text-slate-400' },
            { label: 'cpu peak', value: `${peakCpu}%`, accent: 'text-accent-amber' },
            { label: 'mem now',  value: latest.memory != null ? `${latest.memory.toFixed(0)} MB` : '—', accent: 'text-accent-purple' },
            { label: 'mem avg',  value: `${avgMem} MB`, accent: 'text-slate-400' },
          ].map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center py-2 gap-0.5">
              <span className="font-mono text-2xs text-slate-600 uppercase">{s.label}</span>
              <span className={`font-mono text-xs font-medium ${s.accent} tabular-nums`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === SECONDARY: 2-col smaller charts === */}
      <div className="grid grid-cols-2 gap-3">
        {/* Container count trend */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <Activity size={11} className="text-slate-500" />
              <span className="text-2xs font-medium text-slate-300">Container Count</span>
            </div>
            <span className="font-mono text-2xs text-accent-cyan tabular-nums">
              {latest.containers ?? '—'} running
            </span>
          </div>
          <div className="h-[100px] px-1 pt-2 pb-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCtrs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis hide allowDecimals={false} domain={['auto', 'auto']} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)' }} />
                <Area type="stepAfter" dataKey="containers" name="containers"
                  stroke="#22d3ee" strokeWidth={1.5}
                  fill="url(#gradCtrs)" isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network I/O */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <Wifi size={11} className="text-slate-500" />
              <span className="text-2xs font-medium text-slate-300">Network I/O</span>
            </div>
            <span className="font-mono text-2xs text-accent-green tabular-nums">
              {latest.network != null ? `${latest.network.toFixed(0)} Mbps` : '—'}
            </span>
          </div>
          <div className="h-[100px] px-1 pt-2 pb-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)' }} />
                <Area type="monotone" dataKey="network" name="network"
                  stroke="#22c55e" strokeWidth={1.5}
                  fill="url(#gradNet)" isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
