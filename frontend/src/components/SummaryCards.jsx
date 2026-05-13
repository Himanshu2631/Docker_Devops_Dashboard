import { motion } from 'framer-motion';
import { Box, Play, Square, Activity } from 'lucide-react';

const SummaryCards = ({ containers = [], stats: apiStats, isUpdating = false }) => {
  const safeContainers = Array.isArray(containers) ? containers : [];

  const total   = apiStats?.total  ?? safeContainers.length;
  const running = apiStats?.running ?? safeContainers.filter(c => c.State === 'running').length;
  const stopped = apiStats?.exited  ?? (total - running);

  const cards = [
    { label: 'Total',   value: total,    icon: Box,      accent: 'text-accent-blue',  dot: 'bg-accent-blue'  },
    { label: 'Running', value: running,  icon: Play,     accent: 'text-accent-green', dot: 'bg-accent-green' },
    { label: 'Exited',  value: stopped,  icon: Square,   accent: 'text-accent-red',   dot: 'bg-accent-red'   },
    { label: 'Engine',  value: 'Active', icon: Activity, accent: 'text-accent-cyan',  dot: 'bg-accent-cyan'  },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="card p-4 flex items-center gap-3 relative overflow-hidden group hover:border-white/[0.1] transition-colors"
        >
          {/* Shimmer on update */}
          {isUpdating && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer" />
            </div>
          )}

          <div className={`p-2 rounded-md bg-white/[0.04] border border-white/[0.06] ${card.accent}`}>
            <card.icon size={15} />
          </div>

          <div className="min-w-0">
            <p className="label">{card.label}</p>
            <p className={`font-mono text-xl font-semibold text-white leading-none mt-1`}>
              {card.value}
            </p>
          </div>

          <span className={`ml-auto w-1.5 h-1.5 rounded-full ${card.dot} opacity-60 shrink-0`} />
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;
