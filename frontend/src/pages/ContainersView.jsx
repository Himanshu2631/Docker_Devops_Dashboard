import { motion } from 'framer-motion';
import { Search, Filter, Plus, RefreshCw, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ContainerList from '../components/ContainerList';

const ContainersView = ({ 
  containers, 
  loading, 
  error, 
  isUpdating, 
  onAction, 
  onLogs, 
  onStats, 
  onRefresh 
}) => {
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

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
            <span className="px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan text-[10px] font-bold rounded uppercase tracking-widest border border-accent-cyan/20">Orchestration</span>
            <span className="text-slate-600 text-xs font-mono">Management Workspace</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Container <span className="text-slate-500 font-light">Management</span></h1>
          <p className="text-slate-500 text-sm">Deploy, monitor, and manage your container instances.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onRefresh}
            disabled={isUpdating}
            className={`p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all ${isUpdating ? 'animate-spin' : ''}`}
            title="Refresh List"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            disabled={isGuest}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${isGuest ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-accent-blue text-white hover:bg-accent-blue/90 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]'}`}
          >
            <Plus size={18} />
            <span>Deploy Container</span>
          </button>
        </div>
      </div>

      {isGuest && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-500 text-xs"
        >
          <Shield size={16} />
          <span><strong>GUEST MODE ACTIVE:</strong> Destructive actions (Stop, Delete) are disabled. Log in for full orchestration permissions.</span>
        </motion.div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-[#111114]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-blue transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Filter containers by name, image, or ID..."
            className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue/30 transition-all placeholder:text-slate-600"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all text-sm font-medium">
            <Filter size={16} />
            <span>Filter Status</span>
          </button>
          <div className="h-8 w-[1px] bg-white/5 mx-2 hidden md:block"></div>
          <div className="text-xs font-mono text-slate-500">
            TOTAL: <span className="text-white">{containers.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="relative">
        {loading && !isUpdating ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-[#111114]/40 backdrop-blur-xl border border-white/5 rounded-2xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-12 text-center">
            <p className="text-rose-500 font-bold mb-2">SYSTEM ERROR</p>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            <button onClick={onRefresh} className="px-6 py-2 bg-rose-500/20 text-rose-500 rounded-xl border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all">
              Reconnect to Host
            </button>
          </div>
        ) : (
          <ContainerList 
            containers={containers} 
            onAction={(id, action) => {
              if (isGuest && (action === 'stop' || action === 'delete' || action === 'restart')) {
                alert('Action Denied: Guests cannot modify infrastructure state.');
                return;
              }
              onAction(id, action);
            }} 
            onLogs={onLogs} 
            onStats={onStats} 
          />
        )}
      </div>
    </motion.div>
  );
};

export default ContainersView;
