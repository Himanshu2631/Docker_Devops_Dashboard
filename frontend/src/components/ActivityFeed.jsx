import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Clock, CheckCircle2, AlertCircle, RefreshCw, Activity } from 'lucide-react';


const ActivityFeed = ({ events = [] }) => {
  return (
    <div className="bg-[#111114]/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] bg-gradient-to-br from-white/[0.05] to-transparent h-full flex flex-col">

      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-blue-500" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">Real-Time Activity</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] text-slate-500 font-bold uppercase">Live</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto terminal-scroll p-4 space-y-4">
        <AnimatePresence initial={false}>
          {events.map((event, index) => (
            <motion.div
              key={event.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex gap-3 group"
            >
              <div className="flex flex-col items-center">
                <div className={`p-1.5 rounded-full ${
                  event.type === 'start' ? 'bg-emerald-500/10 text-emerald-500' :
                  event.type === 'stop' ? 'bg-rose-500/10 text-rose-500' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  {event.type === 'start' && <CheckCircle2 size={12} />}
                  {event.type === 'stop' && <AlertCircle size={12} />}
                  {event.type === 'restart' && <RefreshCw size={12} />}
                </div>
                <div className="w-[1px] flex-1 bg-white/5 my-1"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                    {event.containerName}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1 whitespace-nowrap">
                    <Clock size={8} />
                    {event.timestamp}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Container <span className="font-mono text-slate-300">{event.type}ed</span> successfully on node-01
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {events.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
            <Activity size={32} className="mb-2" />
            <p className="text-xs">Listening for events...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
