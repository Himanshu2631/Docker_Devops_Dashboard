import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Plus, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ContainerList from '../components/ContainerList';
import { cn } from '../lib/utils';

/**
 * ContainersView.jsx
 * Operational container management workspace.
 */

const ContainersView = ({
  containers,
  loading,
  error,
  isUpdating,
  onAction,
  onLogs,
  onStats,
  onRefresh,
}) => {
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';
  const [filter, setFilter] = useState('');

  const filtered = Array.isArray(containers)
    ? containers.filter(c => {
        if (!filter) return true;
        const q = filter.toLowerCase();
        const name = (c.Names?.[0] ?? '').toLowerCase();
        return name.includes(q) || c.Image?.toLowerCase().includes(q) || c.Id?.toLowerCase().includes(q);
      })
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* Page header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 bg-accent-cyan/10 text-accent-cyan text-2xs font-semibold rounded border border-accent-cyan/20 uppercase tracking-widest">Containers</span>
            <span className="text-slate-600 text-2xs font-mono">/ management</span>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Container Management</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isUpdating}
            title="Refresh"
            className={cn(
              'p-1.5 rounded-md border border-white/[0.06] bg-surface-1',
              'text-slate-500 hover:text-slate-300 hover:border-white/[0.12]',
              'transition-colors duration-[120ms] disabled:opacity-40'
            )}
          >
            <RefreshCw
              size={14}
              className={cn('transition-transform', isUpdating && 'animate-spin')}
            />
          </button>

          <button
            disabled={isGuest}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border',
              'transition-colors duration-[120ms]',
              isGuest
                ? 'border-white/[0.05] bg-surface-1 text-slate-600 cursor-not-allowed'
                : 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/15 hover:border-accent-blue/40 active:scale-[0.98]'
            )}
          >
            <Plus size={13} />
            <span>Deploy</span>
          </button>
        </div>
      </div>

      {/* Guest warning — compact */}
      {isGuest && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2.5 px-3 py-2 bg-amber-500/8 border border-amber-500/15 rounded-lg text-2xs text-amber-600"
        >
          <Shield size={12} className="shrink-0" />
          <span><strong className="font-semibold">Guest mode:</strong> Destructive actions disabled. Log in for full access.</span>
        </motion.div>
      )}

      {/* Toolbar — inline, not boxed */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm group">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-slate-400 transition-colors duration-[100ms]" />
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter by name, image, or ID…"
            className={cn(
              'w-full card-sm py-1.5 pl-8 pr-3 text-sm',
              'text-slate-300 placeholder:text-slate-600',
              'focus:outline-none focus:border-white/[0.12] focus:bg-surface-2',
              'transition-colors duration-[120ms]'
            )}
          />
        </div>

        <div className="h-4 w-px bg-white/[0.06]" />
        <span className="font-mono text-2xs text-slate-600 tabular-nums">
          {filtered.length}/{containers?.length ?? 0} containers
        </span>
        {filter && (
          <button
            onClick={() => setFilter('')}
            className="text-2xs text-slate-600 hover:text-slate-400 transition-colors duration-[100ms]"
          >
            clear
          </button>
        )}
      </div>

      {/* Content */}
      {loading && !isUpdating ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-44" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      ) : error ? (
        <div className="card p-10 text-center">
          <p className="text-accent-red text-sm font-semibold mb-1">Connection Error</p>
          <p className="text-slate-500 text-sm mb-5">{error}</p>
          <button
            onClick={onRefresh}
            className="px-4 py-1.5 rounded-md border border-accent-red/20 bg-accent-red/8 text-accent-red text-sm hover:bg-accent-red/12 transition-colors duration-[120ms]"
          >
            Retry
          </button>
        </div>
      ) : (
        <ContainerList
          containers={filtered}
          onAction={(id, action) => {
            if (isGuest && ['stop', 'delete', 'restart'].includes(action)) {
              alert('Action denied: Guests cannot modify container state.');
              return;
            }
            onAction(id, action);
          }}
          onLogs={onLogs}
          onStats={onStats}
        />
      )}
    </motion.div>
  );
};

export default ContainersView;
