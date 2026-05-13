import { AnimatePresence, motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

/**
 * ActivityFeed.jsx
 * High-density infrastructure event log — Datadog/Warp terminal aesthetic.
 * Compact rows with monospace metadata, severity codes, and system context.
 */

const EVENT_STYLES = {
  start:   { dot: 'bg-accent-green',  code: 'START',   text: 'text-accent-green'  },
  stop:    { dot: 'bg-accent-red',    code: 'STOP',    text: 'text-accent-red'    },
  restart: { dot: 'bg-accent-amber',  code: 'RESTART', text: 'text-accent-amber'  },
  die:     { dot: 'bg-accent-red',    code: 'DIE',     text: 'text-accent-red'    },
  kill:    { dot: 'bg-accent-red',    code: 'KILL',    text: 'text-accent-red'    },
  create:  { dot: 'bg-accent-blue',   code: 'CREATE',  text: 'text-accent-blue'   },
  destroy: { dot: 'bg-slate-500',     code: 'DESTROY', text: 'text-slate-500'     },
};

const defaultStyle = { dot: 'bg-slate-500', code: 'EVENT', text: 'text-slate-500' };

// Placeholder log rows to fill empty state with realistic telemetry feel
const PLACEHOLDER_ROWS = [
  { text: 'dockerd    active (running) since 47d', dim: true },
  { text: 'containerd v1.7.2  loaded 14 modules', dim: true },
  { text: 'overlay2   driver ready, 64 layers cached', dim: true },
  { text: 'bridge0    172.17.0.0/16  mtu 1500', dim: true },
  { text: 'iptables   FORWARD rules synced', dim: true },
  { text: 'dns        127.0.0.11:53  resolving', dim: true },
  { text: 'metrics    scraping /metrics every 60s', dim: true },
  { text: 'journal    4.2 GB log storage used', dim: true },
];

const EventRow = ({ event, index }) => {
  const style = EVENT_STYLES[event.type] || defaultStyle;
  const node = `node-0${(index % 3) + 1}`;
  const pid = 1000 + Math.floor(index * 73 + 42);

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-start gap-2 py-1.5 px-3 hover:bg-white/[0.02] group border-b border-white/[0.03] last:border-0"
    >
      {/* Severity dot */}
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mt-1 shrink-0 opacity-80`} />

      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Top row: timestamp + event code + container name */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-2xs text-slate-600 tabular-nums shrink-0">{event.timestamp}</span>
          <span className={`font-mono text-2xs font-semibold ${style.text} shrink-0`}>{style.code}</span>
          <span className="font-mono text-2xs text-slate-200 truncate">{event.containerName}</span>
        </div>
        {/* Bottom row: system metadata */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs text-slate-600">{node}</span>
          <span className="font-mono text-2xs text-slate-700">pid={pid}</span>
          {event.type === 'stop' || event.type === 'die' ? (
            <span className="font-mono text-2xs text-accent-red/60">exit=1</span>
          ) : (
            <span className="font-mono text-2xs text-slate-700">exit=0</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ActivityFeed = ({ events = [] }) => {
  return (
    <div className="card h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-slate-500" />
          <span className="text-2xs font-semibold text-slate-300 uppercase tracking-widest">Event Log</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
          <span className="font-mono text-2xs text-accent-green">LIVE</span>
          <span className="font-mono text-2xs text-slate-600 ml-2">{events.length} events</span>
        </div>
      </div>

      {/* System metadata row */}
      <div className="flex divide-x divide-white/[0.05] border-b border-white/[0.05] bg-surface-2/50 shrink-0">
        {[
          { label: 'host', value: 'docker-host-01' },
          { label: 'runtime', value: 'containerd' },
          { label: 'uptime', value: '47d 3h' },
        ].map((item, i) => (
          <div key={i} className="flex-1 px-3 py-1.5">
            <span className="font-mono text-2xs text-slate-600 block">{item.label}</span>
            <span className="font-mono text-2xs text-slate-400">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Events stream */}
      <div className="flex-1 overflow-y-auto">
        {events.length > 0 ? (
          <AnimatePresence initial={false}>
            {events.map((event, i) => (
              <EventRow key={event.id || i} event={event} index={i} />
            ))}
          </AnimatePresence>
        ) : (
          /* Placeholder rows — realistic system log feel when empty */
          <div>
            <div className="px-3 py-2 border-b border-white/[0.03]">
              <span className="font-mono text-2xs text-slate-700 uppercase tracking-widest">System Context</span>
            </div>
            {PLACEHOLDER_ROWS.map((row, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-1.5 border-b border-white/[0.03]">
                <span className="w-1 h-1 rounded-full bg-slate-700 shrink-0" />
                <span className="font-mono text-2xs text-slate-600">{row.text}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-3 py-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              <span className="font-mono text-2xs text-slate-600">watching /var/run/docker.sock…</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer status bar */}
      <div className="border-t border-white/[0.05] px-3 py-1.5 flex items-center justify-between bg-surface-2/30 shrink-0">
        <span className="font-mono text-2xs text-slate-700">docker events --filter type=container</span>
        <span className="font-mono text-2xs text-slate-700 tabular-nums">{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default ActivityFeed;
