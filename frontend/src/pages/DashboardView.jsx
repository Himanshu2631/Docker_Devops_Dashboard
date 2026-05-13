import { motion } from 'framer-motion';
import MonitoringDashboard from '../components/MonitoringDashboard';
import ActivityFeed from '../components/ActivityFeed';
import SummaryCards from '../components/SummaryCards';
import SystemStatsWidgets from '../components/SystemStatsWidgets';

const DashboardView = ({ containers, stats, monitoringData, events, isUpdating, isLive }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 bg-accent-blue/10 text-accent-blue text-2xs font-semibold rounded border border-accent-blue/20 uppercase tracking-widest">Infrastructure</span>
            <span className="text-slate-600 text-2xs font-mono">/ overview</span>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">System Overview</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-accent-green animate-pulse' : 'bg-slate-600'}`} />
          <span className={`font-mono text-2xs font-medium ${isLive ? 'text-accent-green' : 'text-slate-500'}`}>
            {isLive ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Compact infra metadata strip */}
      <div className="flex items-center gap-0 mb-5 border border-white/[0.06] rounded-lg bg-surface-2/50 divide-x divide-white/[0.06] overflow-hidden w-fit">
        {[
          { label: 'Cluster',  value: 'docker-host-01' },
          { label: 'Runtime',  value: 'containerd v1.7.2' },
          { label: 'Engine',   value: 'Docker 24.0.5' },
          { label: 'Nodes',    value: '1 active' },
          { label: 'Network',  value: 'bridge / overlay' },
        ].map((item, i) => (
          <div key={i} className="px-3 py-1.5 flex items-center gap-2">
            <span className="text-2xs text-slate-600 font-mono uppercase">{item.label}</span>
            <span className="text-2xs text-slate-400 font-mono">{item.value}</span>
          </div>
        ))}
      </div>

      <SystemStatsWidgets />
      <SummaryCards containers={containers} stats={stats} isUpdating={isUpdating} />

      {/* Section separator */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xs font-mono text-slate-600 uppercase tracking-widest">Resource Telemetry</span>
        <div className="flex-1 h-px bg-white/[0.05]" />
        <span className="text-2xs font-mono text-slate-700">last 20 snapshots · 60s interval</span>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-8">
        {/* Charts — 8/12 */}
        <div className="col-span-12 lg:col-span-8">
          <MonitoringDashboard data={monitoringData} />
        </div>

        {/* Event log — 4/12 */}
        <div className="col-span-12 lg:col-span-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xs font-mono text-slate-600 uppercase tracking-widest">Event Stream</span>
            <div className="flex-1 h-px bg-white/[0.05]" />
          </div>
          <div className="h-[440px]">
            <ActivityFeed events={events} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardView;
