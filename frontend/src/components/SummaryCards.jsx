import { motion } from 'framer-motion';
import { Box, Play, Square, Activity } from 'lucide-react';

const SummaryCards = ({ containers = [], stats: apiStats, isUpdating = false }) => {
  const safeContainers = Array.isArray(containers) ? containers : [];
  
  const total = apiStats?.total ?? safeContainers.length;
  const running = apiStats?.running ?? safeContainers.filter(c => c.State === 'running').length;
  const stopped = apiStats?.exited ?? (total - running);

  const safeStats = [
    { label: 'Total Containers', value: total, icon: Box, bgColor: 'bg-accent-blue/10', textColor: 'text-accent-blue', delay: 0.1 },
    { label: 'Running', value: running, icon: Play, bgColor: 'bg-accent-cyan/10', textColor: 'text-accent-cyan', delay: 0.2 },
    { label: 'Exited', value: stopped, icon: Square, bgColor: 'bg-rose-500/10', textColor: 'text-rose-500', delay: 0.3 },
    { label: 'Engine Status', value: 'Active', icon: Activity, bgColor: 'bg-accent-purple/10', textColor: 'text-accent-purple', delay: 0.4 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {safeStats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: isUpdating ? [1, 1.02, 1] : 1,
            borderColor: isUpdating ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'
          }}
          transition={{ 
            delay: isUpdating ? 0 : stat.delay,
            scale: { duration: 0.4, ease: "easeInOut" },
            borderColor: { duration: 0.4 }
          }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-[#111114]/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] bg-gradient-to-br from-white/[0.05] to-transparent p-6 flex items-center gap-5 group hover:border-white/10 transition-all duration-300 relative overflow-hidden"
        >
          {isUpdating && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 0.8, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
            />
          )}

          <div className={`p-4 rounded-2xl ${stat.bgColor} ${stat.textColor} group-hover:scale-110 transition-transform relative`}>
            <stat.icon size={24} />
            <div className={`absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity ${stat.bgColor}`}></div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">{stat.value}</h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;
