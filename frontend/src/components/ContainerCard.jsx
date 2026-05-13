import { useState } from 'react';
import { Play, Square, RotateCw, Terminal, BarChart3, Cpu, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

/**
 * ContainerCard.jsx
 * Restrained interaction model: border highlight on hover, 
 * tactical press feedback on buttons, no Y-axis elevation.
 */

const ActionBtn = ({ onClick, title, children, variant = 'default', disabled = false }) => {
  const variants = {
    default: 'bg-white/[0.04] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] hover:border-white/[0.1]',
    start:   'bg-accent-green/10 border-accent-green/20 text-accent-green hover:bg-accent-green/15',
    stop:    'bg-accent-red/10 border-accent-red/20 text-accent-red hover:bg-accent-red/15',
    restart: 'bg-accent-amber/10 border-accent-amber/20 text-accent-amber hover:bg-accent-amber/15',
    logs:    'bg-white/[0.04] border-white/[0.06] text-slate-500 hover:text-accent-blue hover:border-accent-blue/20',
    stats:   'bg-white/[0.04] border-white/[0.06] text-slate-500 hover:text-accent-purple hover:border-accent-purple/20',
  };

  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'p-1.5 rounded-md border transition-colors text-sm',
        'active:scale-95 active:brightness-90',
        'disabled:opacity-30 disabled:cursor-not-allowed',
        variants[variant]
      )}
      style={{ transitionDuration: '100ms' }}
    >
      {children}
    </button>
  );
};

const ContainerCard = ({ container, onAction, onLogs, onStats }) => {
  const [acting, setActing] = useState(false);
  const isRunning = container.State === 'running';
  const name = (container.Names?.[0] ?? 'unnamed').replace('/', '');
  const shortId = container.Id.substring(0, 12);

  const handleAction = async (action) => {
    setActing(true);
    try { await onAction(container.Id, action); }
    finally { setTimeout(() => setActing(false), 800); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'card overflow-hidden group',
        'transition-colors duration-[140ms]',
        'hover:border-white/[0.1]',
        acting && 'opacity-70 pointer-events-none'
      )}
    >
      {/* Status accent line — 2px, no glow */}
      <div className={cn(
        'h-[2px] w-full',
        isRunning ? 'bg-accent-green' : 'bg-surface-3'
      )} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {/* Quiet live indicator */}
              <span className={cn(
                'w-1.5 h-1.5 rounded-full shrink-0',
                isRunning ? 'bg-accent-green' : 'bg-slate-700'
              )} style={isRunning ? { animation: 'pulse 3s ease-in-out infinite' } : {}} />
              <span className="font-mono text-2xs text-slate-600 tabular-nums">{shortId}</span>
            </div>
            <h3 className="text-sm font-semibold text-white truncate leading-snug group-hover:text-accent-blue/90 transition-colors duration-[120ms]">
              {name}
            </h3>
            <p className="text-2xs text-slate-600 font-mono truncate mt-0.5">{container.Image}</p>
          </div>

          {/* Status badge — rectangular, not pill */}
          <span className={cn(
            'px-2 py-0.5 rounded text-2xs font-mono font-medium border shrink-0 ml-2 mt-0.5',
            isRunning
              ? 'bg-accent-green/8 text-accent-green border-accent-green/15'
              : 'bg-slate-800 text-slate-500 border-slate-700'
          )}>
            {isRunning ? 'running' : container.State}
          </span>
        </div>

        {/* Metrics row — single horizontal strip */}
        <div className="flex items-center gap-4 py-2.5 border-y border-white/[0.05] mb-3">
          <div className="flex items-center gap-1.5 flex-1">
            <Cpu size={11} className="text-slate-600 shrink-0" />
            <span className="label">CPU</span>
            <span className="font-mono text-2xs text-slate-400 ml-auto tabular-nums">—</span>
          </div>
          <div className="w-px h-3 bg-white/[0.06]" />
          <div className="flex items-center gap-1.5 flex-1">
            <HardDrive size={11} className="text-slate-600 shrink-0" />
            <span className="label">MEM</span>
            <span className="font-mono text-2xs text-slate-400 ml-auto tabular-nums">—</span>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between">
          {/* Primary actions */}
          <div className="flex items-center gap-1">
            {isRunning ? (
              <ActionBtn onClick={() => handleAction('stop')} title="Stop container" variant="stop">
                <Square size={13} fill="currentColor" />
              </ActionBtn>
            ) : (
              <ActionBtn onClick={() => handleAction('start')} title="Start container" variant="start">
                <Play size={13} fill="currentColor" />
              </ActionBtn>
            )}
            <ActionBtn onClick={() => handleAction('restart')} title="Restart container" variant="restart">
              <RotateCw size={13} className={acting ? 'animate-spin' : ''} />
            </ActionBtn>
          </div>

          {/* Secondary actions */}
          <div className="flex items-center gap-1">
            <ActionBtn onClick={() => onLogs(container.Id, name)} title="View logs" variant="logs">
              <Terminal size={13} />
            </ActionBtn>
            <ActionBtn onClick={() => onStats(container.Id)} title="View stats" variant="stats">
              <BarChart3 size={13} />
            </ActionBtn>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContainerCard;
