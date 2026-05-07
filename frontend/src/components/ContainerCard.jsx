import { Play, Square, RotateCw, Terminal, BarChart3, Trash2, Cpu, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const ContainerCard = ({ container, onAction, onLogs, onStats }) => {
  const isRunning = container.State === 'running';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-[#111114]/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden group"
    >

      {/* Status Bar */}
      <div className={cn(
        "h-1.5 w-full",
        isRunning ? "bg-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "bg-slate-700"
      )} />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
                {container.Id.substring(0, 12)}
              </span>
              {isRunning && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-accent-blue transition-colors truncate max-w-[200px]">
              {(container.Names && container.Names[0]) ? container.Names[0].replace('/', '') : 'Unnamed Container'}
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate">{container.Image}</p>
          </div>
          
          <div className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            isRunning 
              ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20" 
              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
          )}>
            {container.Status}
          </div>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 mb-4">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-slate-500" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">CPU Usage</p>
              <p className="text-xs font-mono text-slate-300">--</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive size={14} className="text-slate-500" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Memory</p>
              <p className="text-xs font-mono text-slate-300">--</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {!isRunning ? (
              <button 
                onClick={() => onAction(container.Id, 'start')}
                className="p-2 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan hover:text-white rounded-lg transition-all"
                title="Start"
              >
                <Play size={18} fill="currentColor" />
              </button>
            ) : (
              <button 
                onClick={() => onAction(container.Id, 'stop')}
                className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                title="Stop"
              >
                <Square size={18} fill="currentColor" />
              </button>
            )}
            <button 
              onClick={() => onAction(container.Id, 'restart')}
              className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all"
              title="Restart"
            >
              <RotateCw size={18} />
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => onLogs(container.Id, (container.Names && container.Names[0]) ? container.Names[0].replace('/', '') : 'Unnamed')}
              className="p-2 bg-white/5 text-slate-400 hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all"
              title="Logs"
            >
              <Terminal size={18} />
            </button>
            <button 
              onClick={() => onStats(container.Id)}
              className="p-2 bg-white/5 text-slate-400 hover:text-accent-purple hover:bg-accent-purple/10 rounded-lg transition-all"
              title="Stats"
            >
              <BarChart3 size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContainerCard;
