import { motion } from 'framer-motion';
import { Shield, Zap, HardDrive, BarChart, Globe } from 'lucide-react';


const StatWidget = ({ icon: Icon, label, value, subValue, colorClass, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="bg-[#111114]/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] bg-gradient-to-br from-white/[0.05] to-transparent p-4 transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.07] hover:border-white/10 flex flex-col justify-between"
  >

    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${colorClass.bg} ${colorClass.text}`}>
        <Icon size={16} />
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-[10px] font-bold uppercase tracking-tighter ${colorClass.text}`}>{label}</span>
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[8px] text-slate-500 font-bold">STABLE</span>
        </div>
      </div>
    </div>
    
    <div>
      <div className="text-xl font-mono text-white font-bold mb-1">{value}</div>
      <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{subValue}</div>
    </div>
    
    <div className="mt-3 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '70%' }}
        className={`h-full ${colorClass.gradient}`}
      ></motion.div>
    </div>
  </motion.div>
);

const SystemStatsWidgets = () => {
  const widgets = [
    {
      icon: Shield,
      label: 'Engine Health',
      value: '99.9%',
      subValue: 'Docker v24.0.5',
      colorClass: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-500',
        gradient: 'bg-gradient-to-r from-emerald-500 to-teal-400',
        glow: 'neon-glow-emerald'
      }
    },
    {
      icon: Zap,
      label: 'API Latency',
      value: '12ms',
      subValue: 'Response Time',
      colorClass: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-500',
        gradient: 'bg-gradient-to-r from-amber-500 to-orange-400',
        glow: 'neon-glow-amber'
      }
    },
    {
      icon: BarChart,
      label: 'System Load',
      value: '1.24',
      subValue: 'AVG 15 MIN',
      colorClass: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        gradient: 'bg-gradient-to-r from-blue-500 to-cyan-400',
        glow: 'neon-glow-blue'
      }
    },

    {
      icon: HardDrive,
      label: 'Disk Usage',
      value: '64.2%',
      subValue: 'Volumes / Images',
      colorClass: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-500',
        gradient: 'bg-gradient-to-r from-purple-500 to-pink-400',
        glow: 'neon-glow-purple'
      }
    },
    {
      icon: Globe,
      label: 'Network I/O',
      value: '420Mbps',
      subValue: 'Aggregate Traffic',
      colorClass: {
        bg: 'bg-rose-500/10',
        text: 'text-rose-500',
        gradient: 'bg-gradient-to-r from-rose-500 to-red-400',
        glow: 'neon-glow-rose'
      }
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
      {widgets.map((widget, idx) => (
        <StatWidget key={idx} {...widget} delay={idx * 0.1} />
      ))}
    </div>
  );
};

export default SystemStatsWidgets;
