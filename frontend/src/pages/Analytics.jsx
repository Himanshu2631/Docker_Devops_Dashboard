import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { 
  TrendingUp, Activity, Clock, Zap, Database, Server, 
  Filter, Calendar, ChevronDown, BarChart3, PieChart as PieIcon, 
  Info, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

/**
 * Analytics.jsx
 * -------------
 * Historical infrastructure observability platform.
 * Visualizes CPU, Memory, and Uptime trends using high-fidelity animated charts.
 */

const Analytics = ({ containers = [] }) => {
  const { api } = useAuth();
  
  const [range, setRange] = useState('24h');
  const [selectedContainer, setSelectedContainer] = useState('global');
  const [trendData, setTrendData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    setIsRefreshing(true);
    try {
      // Fetch Trends
      const trendRes = await api.get(`/analytics/trends`, {
        params: { 
          containerId: selectedContainer === 'global' ? undefined : selectedContainer,
          range,
          interval: range === '1h' ? '1m' : '1h'
        }
      });
      
      if (trendRes.data.success) {
        setTrendData(trendRes.data.data);
      }

      // Fetch Summary if container selected, else calculate global
      if (selectedContainer !== 'global') {
        const summaryRes = await api.get(`/analytics/summary/${selectedContainer}`, {
          params: { range }
        });
        if (summaryRes.data.success) {
          setSummary(summaryRes.data.summary);
        }
      } else {
        // Calculate global summary from current containers and trends
        const avgCpu = trendData.reduce((acc, curr) => acc + curr.cpu, 0) / (trendData.length || 1);
        const avgMem = trendData.reduce((acc, curr) => acc + curr.memory, 0) / (trendData.length || 1);
        setSummary({
          avgCpu: avgCpu.toFixed(2),
          avgMem: avgMem.toFixed(2),
          uptimePercentage: 100, // Placeholder for global
          dataPoints: trendData.length
        });
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range, selectedContainer]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a20]/95 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <div className="text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-widest">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 py-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs font-black text-white uppercase">{entry.name}:</span>
              <span className="text-xs font-mono text-white/80 ml-auto">{entry.value}{entry.name === 'CPU' ? '%' : ' MB'}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const Card = ({ children, title, icon: Icon, className = "" }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#0c0c0e]/60 backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group ${className}`}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-2xl text-accent-blue border border-white/5 group-hover:border-accent-blue/30 transition-colors">
            <Icon size={20} />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">{title}</h3>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/10" />)}
        </div>
      </div>
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
            Analytics <span className="text-accent-blue opacity-50 font-light">Engine</span>
            <div className={`p-2 rounded-xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20 text-xs not-italic tracking-normal font-bold ${isRefreshing ? 'animate-spin' : ''}`}>
              <RefreshCw size={14} />
            </div>
          </h1>
          <p className="text-slate-500 text-xs font-mono mt-2 uppercase tracking-[0.3em]">Historical infrastructure telemetry & trend analysis</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white/5 p-2 rounded-[24px] border border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 px-4 border-r border-white/10 mr-2">
            <Filter size={14} className="text-accent-blue" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters</span>
          </div>
          
          {/* Container Selector */}
          <select 
            value={selectedContainer}
            onChange={(e) => setSelectedContainer(e.target.value)}
            className="bg-black/40 text-[11px] text-white font-bold py-2.5 px-4 rounded-xl border border-white/5 outline-none hover:border-white/20 transition-all cursor-pointer uppercase tracking-wider min-w-[180px]"
          >
            <option value="global">Global Infrastructure</option>
            {containers.map(c => (
              <option key={c.Id} value={c.Id}>{c.Names[0].replace('/', '')}</option>
            ))}
          </select>

          {/* Range Selector */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            {['1h', '24h', '7d', '30d'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${range === r ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20' : 'text-slate-500 hover:text-white'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg CPU Load', value: `${summary?.avgCpu || 0}%`, icon: Zap, color: 'text-accent-cyan', sub: 'Calculated Trend' },
          { label: 'Peak Memory', value: `${summary?.peakMem || summary?.avgMem || 0} MB`, icon: Database, color: 'text-accent-purple', sub: 'Max Threshold' },
          { label: 'Uptime Score', value: `${summary?.uptimePercentage || 0}%`, icon: Activity, color: 'text-emerald-500', sub: 'Availability' },
          { label: 'Data Snapshots', value: summary?.dataPoints || 0, icon: Clock, color: 'text-orange-500', sub: 'Capture Points' }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#0c0c0e]/60 backdrop-blur-3xl border border-white/5 p-6 rounded-[32px] group hover:border-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon size={20} />
              </div>
              <TrendingUp size={14} className="text-emerald-500 opacity-50" />
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</div>
            <div className="text-3xl font-black text-white mt-1 tracking-tighter italic">{item.value}</div>
            <div className="text-[9px] text-slate-600 font-mono mt-2 uppercase tracking-tighter">{item.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Trends Chart */}
      <Card title="Resource Utilization Trends" icon={TrendingUp} className="lg:col-span-2">
        <div className="h-[400px] w-full mt-4">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-slate-600 font-mono animate-pulse">Initializing Data Stream...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 10, fontBold: '900' }}
                  tickFormatter={(t) => t.split('T')[1]?.substring(0, 5) || t}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 10, fontBold: '900' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff10', strokeWidth: 1 }} />
                <Area 
                  name="CPU"
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCpu)" 
                  animationDuration={2000}
                />
                <Area 
                  name="Memory"
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#a855f7" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMem)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Availability Analytics */}
        <Card title="Infrastructure Health" icon={Activity}>
          <div className="flex items-center justify-center h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Uptime', value: parseFloat(summary?.uptimePercentage || 100) },
                    { name: 'Downtime', value: 100 - parseFloat(summary?.uptimePercentage || 100) }
                  ]}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  <Cell fill="#10b981" stroke="none" />
                  <Cell fill="#f43f5e" stroke="none" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <div className="text-3xl font-black text-white italic">{summary?.uptimePercentage || 100}%</div>
              <div className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Availability</div>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] text-slate-400 font-black uppercase">Active Time</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-[10px] text-slate-400 font-black uppercase">Critical Failures</span></div>
          </div>
        </Card>

        {/* Load Distribution */}
        <Card title="Resource Distribution" icon={BarChart3}>
          <div className="h-[250px] mt-4">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData.slice(-10)}>
                  <XAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cpu" radius={[4, 4, 0, 0]}>
                    {trendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cpu > 15 ? '#f43f5e' : '#3b82f6'} opacity={0.6} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
          <p className="text-[9px] text-slate-600 font-mono text-center uppercase tracking-tighter mt-4">Snapshot analysis of recent peak loads across the cluster</p>
        </Card>
      </div>

      {/* Decorative Scanline/CRT effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
};

export default Analytics;
