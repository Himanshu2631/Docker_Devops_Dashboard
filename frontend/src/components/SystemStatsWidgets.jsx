import { motion } from 'framer-motion';
import { Shield, Zap, BarChart2, HardDrive, Globe } from 'lucide-react';

const widgets = [
  { icon: Shield,   label: 'Engine Health', value: '99.9%',  sub: 'Docker v24.0.5',    barPct: 99, barColor: 'bg-accent-green'  },
  { icon: Zap,      label: 'API Latency',   value: '12ms',   sub: 'p95 Response',       barPct: 20, barColor: 'bg-accent-amber'  },
  { icon: BarChart2,label: 'System Load',   value: '1.24',   sub: 'avg 15 min',         barPct: 42, barColor: 'bg-accent-blue'   },
  { icon: HardDrive,label: 'Disk Usage',    value: '64.2%',  sub: 'Volumes / Images',   barPct: 64, barColor: 'bg-accent-purple' },
  { icon: Globe,    label: 'Network I/O',   value: '420 Mbps',sub: 'Aggregate traffic', barPct: 72, barColor: 'bg-accent-cyan'   },
];

const SystemStatsWidgets = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
    {widgets.map((w, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.07 }}
        className="card p-4 flex flex-col gap-3 hover:border-white/[0.1] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <w.icon size={13} className="text-slate-500" />
            <span className="label">{w.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-accent-green opacity-70" />
          </div>
        </div>

        <div>
          <span className="font-mono text-lg font-semibold text-white leading-none">{w.value}</span>
          <p className="text-2xs text-slate-600 mt-0.5 uppercase tracking-wider">{w.sub}</p>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${w.barPct}%` }}
            transition={{ delay: i * 0.07 + 0.2, duration: 0.6, ease: 'easeOut' }}
            className={`h-full ${w.barColor} opacity-60`}
          />
        </div>
      </motion.div>
    ))}
  </div>
);

export default SystemStatsWidgets;
