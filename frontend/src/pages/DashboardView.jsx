import { motion } from 'framer-motion';
import MonitoringDashboard from '../components/MonitoringDashboard';
import ActivityFeed from '../components/ActivityFeed';
import SummaryCards from '../components/SummaryCards';
import SystemStatsWidgets from '../components/SystemStatsWidgets';

const DashboardView = ({ containers, stats, monitoringData, events, isUpdating, isLive }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-accent-blue/10 text-accent-blue text-[10px] font-bold rounded uppercase tracking-widest border border-accent-blue/20">Infrastructure Hub</span>
            <span className="text-slate-600 text-xs font-mono">Real-time Telemetry</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">System <span className="text-slate-500 font-light">Overview</span></h1>
          <p className="text-slate-500 text-sm">Global monitoring and infrastructure health status.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Engine Status</span>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
              <span className={`text-xs font-mono font-bold ${isLive ? 'text-emerald-500' : 'text-slate-500'}`}>
                {isLive ? 'STABLE / ONLINE' : 'DISCONNECTED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <SystemStatsWidgets />
      <SummaryCards containers={containers} stats={stats} isUpdating={isUpdating} />

      <div className="grid grid-cols-12 gap-6 mb-12">
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="w-1.5 h-5 bg-accent-blue rounded-full"></div>
              Resource Telemetry
            </h2>
          </div>
          <MonitoringDashboard data={monitoringData} />
        </div>
        
        <div className="col-span-12 lg:col-span-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="w-1.5 h-5 bg-accent-purple rounded-full"></div>
              Live Activity
            </h2>
          </div>
          <div className="h-[500px]">
            <ActivityFeed events={events} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardView;
