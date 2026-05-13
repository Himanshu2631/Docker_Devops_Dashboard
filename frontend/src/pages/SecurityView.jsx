import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldAlert, ShieldCheck, Lock, Unlock,
  Activity, AlertTriangle, CheckCircle, XCircle,
  Eye, Server, Network, Key, User, Clock,
  RefreshCw, Terminal, Cpu, Globe, AlertCircle, Wifi
} from 'lucide-react';

// ─── Shared helpers ──────────────────────────────────────────────────────────
const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });

const STATUS = {
  secure:   { label: 'Secure',   cls: 'text-accent-green  bg-green-500/8  border-green-500/15',  dot: 'bg-accent-green'  },
  warning:  { label: 'Warning',  cls: 'text-amber-400     bg-amber-500/8  border-amber-500/15',   dot: 'bg-amber-400'     },
  critical: { label: 'Critical', cls: 'text-accent-red    bg-red-500/8    border-red-500/15',     dot: 'bg-accent-red'    },
};

const StatusBadge = ({ level }) => {
  const s = STATUS[level] || STATUS.secure;
  return (
    <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded border text-2xs font-mono ${s.cls}`}>
      <span className={`w-1 h-1 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const PulsingDot = ({ color = 'bg-accent-green', size = 'w-1.5 h-1.5' }) => (
  <span className="relative inline-flex">
    <span className={`${size} rounded-full ${color} opacity-80`} />
    <span className={`absolute inset-0 rounded-full ${color} animate-ping opacity-30`} />
  </span>
);

const Panel = ({ title, subtitle, badge, children, className = '' }) => (
  <div className={`bg-surface-1 border border-white/[0.06] rounded-xl overflow-hidden ${className}`}>
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-white">{title}</span>
        {subtitle && <span className="text-2xs font-mono text-slate-600">{subtitle}</span>}
      </div>
      {badge}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// ─── Security Score ──────────────────────────────────────────────────────────
const SecurityScore = ({ score }) => {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#f43f5e';
  const r = 44, circ = 2 * Math.PI * r;
  const dash = circ - (score / 100) * circ;
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeLinecap="round"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: dash }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-white tabular-nums">{score}</span>
          <span className="text-2xs font-mono text-slate-600">/100</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {[
          { label: 'Containers scanned', value: '8/8',   ok: true  },
          { label: 'Open CVEs',          value: '3',     ok: false },
          { label: 'Daemon TLS',         value: 'Active', ok: true  },
          { label: 'Root access',        value: 'None',  ok: true  },
        ].map(({ label, value, ok }) => (
          <div key={label} className="flex items-center gap-2">
            {ok ? <CheckCircle size={12} className="text-accent-green flex-shrink-0" />
                : <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />}
            <span className="text-2xs font-mono text-slate-600 w-40">{label}</span>
            <span className={`text-2xs font-mono ${ok ? 'text-slate-400' : 'text-amber-400'}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Daemon protection checks ────────────────────────────────────────────────
const DAEMON_CHECKS = [
  { id: 'tls',     label: 'TLS Encryption',        status: 'secure',  detail: 'mTLS v1.3 active'         },
  { id: 'sock',    label: 'Unix Socket',            status: 'secure',  detail: '/var/run/docker.sock'     },
  { id: 'rootful', label: 'Rootless Mode',          status: 'warning', detail: 'Running as root'          },
  { id: 'seccomp', label: 'Seccomp Profile',        status: 'secure',  detail: 'Default profile enforced' },
  { id: 'net',     label: 'Exposed API Port',       status: 'secure',  detail: 'Port 2375 closed'         },
  { id: 'ns',      label: 'User Namespace Remap',   status: 'warning', detail: 'Not configured'           },
];

// ─── Container vulnerabilities ───────────────────────────────────────────────
const VULN_DATA = [
  { name: 'nginx',          tag: 'latest',    level: 'warning',  cves: 3, scan: 100 },
  { name: 'mongo',          tag: '6.0',       level: 'secure',   cves: 0, scan: 100 },
  { name: 'redis',          tag: '7-alpine',  level: 'secure',   cves: 0, scan: 100 },
  { name: 'express-backend',tag: 'local',     level: 'secure',   cves: 0, scan: 100 },
  { name: 'node',           tag: '20-slim',   level: 'warning',  cves: 1, scan: 100 },
  { name: 'unknown-image',  tag: 'none',      level: 'critical', cves: 7, scan: 62  },
];

// ─── Alert feed ──────────────────────────────────────────────────────────────
const ALERT_SEED = [
  { level: 'warning',  msg: 'Container "nginx" running as root',        ts: '16:41:02' },
  { level: 'secure',   msg: 'JWT rotation completed successfully',       ts: '16:39:18' },
  { level: 'warning',  msg: 'CVE-2024-38428 detected in curl 8.5.0',    ts: '16:37:55' },
  { level: 'secure',   msg: 'Docker socket access audit passed',         ts: '16:35:40' },
  { level: 'critical', msg: 'Untagged image with 7 known CVEs present',  ts: '16:33:11' },
  { level: 'warning',  msg: 'User namespace remapping not configured',   ts: '16:30:04' },
];

// ─── Fake log stream ─────────────────────────────────────────────────────────
const LOG_POOL = [
  '[audit] socket access: /var/run/docker.sock — PID 3821',
  '[auth] JWT validated — user: admin — exp in 3580s',
  '[scan] CVE lookup: curl/8.5.0 → 1 match found',
  '[net] ingress packet 10.0.0.4:51234 → :443 accepted',
  '[daemon] seccomp profile reload — ok',
  '[auth] session heartbeat — token stable',
  '[scan] image mongo:6.0 — no CVEs found',
  '[net] DNS query: docker.io resolved in 24ms',
  '[audit] container create event logged',
  '[auth] failed login attempt from 192.168.1.42',
];

// ─── Main Page ────────────────────────────────────────────────────────────────
const SecurityView = () => {
  const [logs, setLogs]         = useState(() => LOG_POOL.slice(0, 6).map((l, i) => ({ id: i, text: l, ts: now() })));
  const [alerts, setAlerts]     = useState(ALERT_SEED);
  const [scanProgress, setScan] = useState(62);
  const [scanning, setScanning] = useState(false);
  const logId = useRef(10);

  // Live log ticker
  useEffect(() => {
    const t = setInterval(() => {
      const entry = { id: logId.current++, text: LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)], ts: now() };
      setLogs(prev => [entry, ...prev].slice(0, 14));
    }, 3800);
    return () => clearInterval(t);
  }, []);

  // Simulate scan progress
  const runScan = () => {
    if (scanning) return;
    setScanning(true);
    setScan(0);
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 12 + 4;
      if (p >= 100) { p = 100; clearInterval(t); setScanning(false); }
      setScan(Math.min(100, Math.round(p)));
    }, 220);
  };

  const score = 74;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="pb-16 space-y-4"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-2xs font-semibold rounded border border-amber-500/20 uppercase tracking-widest">Security</span>
            <span className="text-slate-600 text-2xs font-mono">/ posture</span>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Security Posture</h1>
        </div>
        <div className="flex items-center gap-2">
          <PulsingDot color="bg-amber-400" />
          <span className="text-2xs font-mono text-slate-600">monitoring active</span>
        </div>
      </div>

      {/* ── Metadata strip ── */}
      <div className="flex items-center gap-0 border border-white/[0.06] rounded-lg bg-surface-1/50 divide-x divide-white/[0.06] overflow-hidden w-fit">
        {[
          { k: 'Score',    v: `${score}/100` },
          { k: 'CVEs',     v: '4 open'       },
          { k: 'Checks',   v: '6 active'     },
          { k: 'Last scan',v: '4m ago'       },
        ].map(({ k, v }) => (
          <div key={k} className="px-3 py-1.5 flex items-center gap-2">
            <span className="text-2xs text-slate-600 font-mono uppercase">{k}</span>
            <span className="text-2xs text-slate-400 font-mono tabular-nums">{v}</span>
          </div>
        ))}
      </div>

      {/* ── Row 1: Score + Daemon ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">

        <Panel title="Security Score" subtitle="posture overview"
          badge={<StatusBadge level="warning" />}
          className="lg:w-[400px]"
        >
          <SecurityScore score={score} />
        </Panel>

        <Panel title="Daemon Protection" subtitle="6 checks"
          badge={<span className="text-2xs font-mono text-slate-600">docker daemon</span>}
        >
          <div className="space-y-2">
            {DAEMON_CHECKS.map(c => (
              <div key={c.id} className="flex items-center gap-3 py-1.5 border-b border-white/[0.03] last:border-0">
                <div className="flex-shrink-0">
                  {c.status === 'secure'
                    ? <ShieldCheck size={13} className="text-accent-green" />
                    : c.status === 'warning'
                    ? <ShieldAlert size={13} className="text-amber-400" />
                    : <XCircle size={13} className="text-accent-red" />}
                </div>
                <span className="text-xs font-medium text-slate-400 w-44">{c.label}</span>
                <span className="text-2xs font-mono text-slate-600 flex-1">{c.detail}</span>
                <StatusBadge level={c.status} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* ── Row 2: Vuln Scanner + Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">

        <Panel
          title="Container Vulnerability Scan"
          subtitle={`${VULN_DATA.length} images`}
          badge={
            <button
              onClick={runScan}
              disabled={scanning}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-accent-blue/25 bg-accent-blue/10 text-accent-blue text-2xs font-mono hover:bg-accent-blue/15 transition-colors disabled:opacity-50"
            >
              <ScanLine size={11} className={scanning ? 'animate-pulse' : ''} />
              {scanning ? `Scanning ${scanProgress}%` : 'Re-scan'}
            </button>
          }
        >
          {/* Scan progress bar */}
          {(scanning || scanProgress < 100) && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xs font-mono text-slate-600">Scan progress</span>
                <span className="text-2xs font-mono text-accent-blue tabular-nums">{scanProgress}%</span>
              </div>
              <div className="h-0.5 bg-surface-3 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent-blue/70 rounded-full"
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            {VULN_DATA.map((img, i) => (
              <motion.div
                key={img.name}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-2/50 border border-white/[0.04] hover:border-white/[0.08] transition-colors"
              >
                <div className="flex-shrink-0">
                  {img.level === 'secure'
                    ? <ShieldCheck size={14} className="text-accent-green" />
                    : img.level === 'warning'
                    ? <ShieldAlert size={14} className="text-amber-400" />
                    : <Shield size={14} className="text-accent-red" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{img.name}</span>
                    <span className="text-2xs font-mono text-slate-700">:{img.tag}</span>
                  </div>
                  {img.scan < 100 && (
                    <div className="h-0.5 bg-surface-3 rounded-full overflow-hidden mt-1.5 w-24">
                      <motion.div
                        className="h-full bg-amber-400/60 rounded-full"
                        animate={{ width: `${img.scan}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {img.cves > 0
                    ? <span className="text-2xs font-mono text-amber-400 tabular-nums">{img.cves} CVE{img.cves > 1 ? 's' : ''}</span>
                    : <span className="text-2xs font-mono text-slate-700">clean</span>}
                  <StatusBadge level={img.level} />
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>

        <Panel title="Security Alerts" subtitle="live feed"
          badge={<PulsingDot color="bg-amber-400" size="w-1.5 h-1.5" />}
        >
          <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
            {alerts.map((a, i) => {
              const icon = a.level === 'critical' ? <XCircle size={12} className="text-accent-red flex-shrink-0 mt-0.5" />
                         : a.level === 'warning'  ? <AlertTriangle size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
                         : <CheckCircle size={12} className="text-accent-green flex-shrink-0 mt-0.5" />;
              return (
                <div key={i} className={`flex gap-2.5 p-2.5 rounded-lg border text-2xs ${
                  a.level === 'critical' ? 'bg-red-500/5 border-red-500/10'
                  : a.level === 'warning' ? 'bg-amber-500/5 border-amber-500/10'
                  : 'bg-surface-2/40 border-white/[0.04]'
                }`}>
                  {icon}
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-slate-400 leading-snug">{a.msg}</div>
                    <div className="font-mono text-slate-700 mt-0.5 tabular-nums">{a.ts}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* ── Row 3: Network + Auth ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Panel title="Network Exposure" subtitle="firewall & ports"
          badge={<StatusBadge level="secure" />}
        >
          <div className="space-y-2">
            {[
              { port: '2375', proto: 'TCP', label: 'Docker API (unencrypted)', open: false },
              { port: '2376', proto: 'TCP', label: 'Docker API (TLS)',         open: true,  listening: true },
              { port: '80',   proto: 'TCP', label: 'HTTP (nginx)',             open: true,  listening: true },
              { port: '443',  proto: 'TCP', label: 'HTTPS',                   open: true,  listening: true },
              { port: '27017',proto: 'TCP', label: 'MongoDB',                 open: false },
              { port: '6379', proto: 'TCP', label: 'Redis',                   open: false },
            ].map(row => (
              <div key={row.port} className="flex items-center gap-3 py-1.5 border-b border-white/[0.03] last:border-0">
                <span className="text-2xs font-mono text-slate-600 w-10 tabular-nums">{row.port}</span>
                <span className="text-2xs font-mono text-slate-700 w-8">{row.proto}</span>
                <span className="text-2xs text-slate-500 flex-1">{row.label}</span>
                {row.open
                  ? <span className="flex items-center gap-1 text-2xs font-mono text-accent-green">
                      {row.listening && <PulsingDot color="bg-accent-green" size="w-1 h-1" />} listening
                    </span>
                  : <span className="text-2xs font-mono text-slate-700">closed</span>}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Auth & Sessions" subtitle="JWT + login events"
          badge={<StatusBadge level="warning" />}
        >
          <div className="space-y-3">
            {/* JWT health */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'JWT Secret',   v: 'HS256 · 512-bit', ok: true  },
                { k: 'Token expiry', v: '3600s',            ok: true  },
                { k: 'Active sessions', v: '1',             ok: true  },
                { k: 'Failed logins',   v: '3 (24h)',       ok: false },
              ].map(({ k, v, ok }) => (
                <div key={k} className="bg-surface-2 rounded-lg p-2.5">
                  <div className="text-2xs font-mono text-slate-600 mb-1">{k}</div>
                  <div className={`text-xs font-mono ${ok ? 'text-slate-300' : 'text-amber-400'}`}>{v}</div>
                </div>
              ))}
            </div>

            {/* Failed login attempts */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Key size={11} className="text-slate-600" />
                <span className="text-2xs font-mono text-slate-600 uppercase tracking-widest">Failed Logins (24h)</span>
              </div>
              {[
                { ip: '192.168.1.42', user: 'admin',  ts: '16:30:04', count: 2 },
                { ip: '10.0.0.7',     user: 'root',   ts: '14:12:38', count: 1 },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/[0.03] last:border-0">
                  <AlertCircle size={11} className="text-amber-400 flex-shrink-0" />
                  <span className="text-2xs font-mono text-slate-600 w-24 tabular-nums">{a.ip}</span>
                  <span className="text-2xs font-mono text-slate-700 flex-1">user: {a.user}</span>
                  <span className="text-2xs font-mono text-amber-400 tabular-nums">{a.count}x</span>
                  <span className="text-2xs font-mono text-slate-700 tabular-nums">{a.ts}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* ── Row 4: Audit Log ── */}
      <Panel title="Security Audit Log" subtitle="live stream"
        badge={<PulsingDot color="bg-accent-green" />}
      >
        <div className="bg-[#09090b] rounded-lg border border-white/[0.04] p-3 max-h-56 overflow-y-auto font-mono space-y-0.5">
          <AnimatePresence initial={false}>
            {logs.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start gap-3 py-0.5"
              >
                <span className="text-2xs text-slate-700 tabular-nums w-16 flex-shrink-0">{entry.ts}</span>
                <span className={`text-2xs ${
                  entry.text.includes('failed') || entry.text.includes('CVE') ? 'text-amber-500'
                  : entry.text.includes('validated') || entry.text.includes('accepted') ? 'text-accent-green/80'
                  : 'text-slate-500'
                }`}>{entry.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Panel>
    </motion.div>
  );
};

// icon needed by scan button
function ScanLine({ size = 16, className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}

export default SecurityView;
