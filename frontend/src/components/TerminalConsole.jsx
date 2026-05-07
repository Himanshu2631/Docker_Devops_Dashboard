import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Maximize2, Minimize2, X, ChevronRight, Hash } from 'lucide-react';

const TerminalConsole = ({ logs = '', isOpen, onClose, containerName = 'System' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={`fixed bottom-0 right-0 left-[280px] z-40 transition-all duration-500 ease-in-out ${
        isExpanded ? 'h-[60vh]' : 'h-64'
      } px-8 pb-4`}
    >
      <div className="h-full bg-black/90 backdrop-blur-2xl border-t border-x border-white/10 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50 border border-rose-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50 border border-amber-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 border border-emerald-500/50"></div>
            </div>
            <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">
                bash &mdash; {containerName}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white/5 rounded-md text-slate-500 hover:text-white transition-colors"
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-rose-500/10 rounded-md text-slate-500 hover:text-rose-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 font-mono text-[13px] leading-relaxed terminal-scroll"
        >
          <div className="space-y-1">
            <div className="flex gap-2 text-emerald-500/80 mb-4">
              <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
              <span>Initializing log stream for target: {containerName}...</span>
            </div>
            
            {logs.split('\n').map((line, i) => (
              <div key={i} className="flex gap-3 group">
                <span className="text-slate-700 select-none w-8 text-right pr-2 border-r border-white/5">{i + 1}</span>
                <span className="text-slate-300 flex-1 break-all">
                  {line.includes('ERROR') || line.includes('error') ? (
                    <span className="text-rose-400">{line}</span>
                  ) : line.includes('WARN') ? (
                    <span className="text-amber-400">{line}</span>
                  ) : line.includes('INFO') ? (
                    <span className="text-blue-400">{line}</span>
                  ) : (
                    line
                  )}
                </span>
              </div>
            ))}
            
            <div className="flex items-center gap-2 mt-4 text-blue-400/60">
              <ChevronRight size={14} />
              <div className="w-2 h-4 bg-blue-400/60 animate-blink"></div>
            </div>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="px-6 py-2 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-4 text-[9px] font-mono text-slate-600 uppercase">
            <span className="flex items-center gap-1"><Hash size={8} /> UTF-8</span>
            <span>Logs: {logs.split('\n').length} lines</span>
          </div>
          <div className="text-[9px] font-mono text-slate-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500/50 rounded-full"></span>
            CONNECTED
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TerminalConsole;
