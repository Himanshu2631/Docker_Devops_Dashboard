import ContainerCard from './ContainerCard';
import { motion, AnimatePresence } from 'framer-motion';

const ContainerList = ({ containers, onAction, onLogs, onStats }) => {
  const safeContainers = Array.isArray(containers) ? containers.filter(c => c && c.Id) : [];

  if (safeContainers.length === 0) {
    return (
      <div className="bg-[#111114]/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
          <div className="w-8 h-8 border-2 border-slate-700 border-dashed rounded-full" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Containers Found</h3>
        <p className="text-slate-500 max-w-xs">Start some Docker containers to see them appear here in real-time.</p>
      </div>
    );

  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {safeContainers.map((container) => (
          <ContainerCard 
            key={container.Id} 
            container={container} 
            onAction={onAction}
            onLogs={onLogs}
            onStats={onStats}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ContainerList;
