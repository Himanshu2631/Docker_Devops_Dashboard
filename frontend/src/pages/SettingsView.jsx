import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Palette, Bell, Container, Key, Puzzle,
  Monitor, Smartphone, Save, Check, Eye, EyeOff,
  RefreshCw, GitBranch, Trash2, Plus, Shield, LogOut,
  ChevronRight, Copy, AlertTriangle, ToggleLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Shared primitives ────────────────────────────────────────────────────────

const Toggle = ({ on, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!on)}
    disabled={disabled}
    className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors duration-150 focus:outline-none
      ${on ? 'bg-accent-blue' : 'bg-surface-3'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <motion.span
      layout
      className="absolute w-3.5 h-3.5 bg-white rounded-full shadow"
      animate={{ x: on ? 19 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </button>
);

const Field = ({ label, hint, children }) => (
  <div className="flex items-start justify-between gap-6 py-3.5 border-b border-white/[0.04] last:border-0">
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-white">{label}</div>
      {hint && <div className="text-2xs font-mono text-slate-600 mt-0.5">{hint}</div>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const TextInput = ({ value, onChange, placeholder, type = 'text', mono = false }) => (
  <input
    type={type} value={value} onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className={`bg-surface-2 border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-slate-300
      placeholder:text-slate-700 focus:outline-none focus:border-accent-blue/30 focus:bg-surface-3
      transition-colors w-56 ${mono ? 'font-mono' : ''}`}
  />
);

const SaveBtn = ({ saving, saved, onClick, label = 'Save changes' }) => (
  <button
    onClick={onClick} disabled={saving || saved}
    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
      ${saved
        ? 'bg-green-500/10 border border-green-500/20 text-accent-green cursor-default'
        : 'bg-accent-blue/10 border border-accent-blue/25 text-accent-blue hover:bg-accent-blue/15 active:scale-[0.98]'}
      disabled:opacity-60`}
  >
    {saved ? <Check size={13} /> : saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
    {saved ? 'Saved' : label}
  </button>
);

const useSave = () => {
  const [state, setState] = useState('idle');
  const trigger = useCallback(() => {
    setState('saving');
    setTimeout(() => { setState('saved'); setTimeout(() => setState('idle'), 2000); }, 900);
  }, []);
  return { saving: state === 'saving', saved: state === 'saved', trigger };
};

// ─── Settings Sections ────────────────────────────────────────────────────────

const SectionProfile = () => {
  const [name, setName]   = useState('Himanshu Sengar');
  const [email, setEmail] = useState('himanshu@devops.local');
  const [bio, setBio]     = useState('Platform engineer. Docker + K8s.');
  const s = useSave();
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Profile</h2>
          <p className="text-2xs font-mono text-slate-600 mt-0.5">Personal information and account identity</p>
        </div>
        <SaveBtn saving={s.saving} saved={s.saved} onClick={s.trigger} />
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-5 p-4 bg-surface-2/50 border border-white/[0.05] rounded-xl mb-4">
        <div className="w-14 h-14 rounded-xl bg-accent-blue/15 border border-accent-blue/20 flex items-center justify-center text-xl font-bold text-accent-blue flex-shrink-0">
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{name}</div>
          <div className="text-2xs font-mono text-slate-600 mt-0.5">{email}</div>
        </div>
        <button className="ml-auto text-2xs font-mono text-slate-600 hover:text-slate-400 transition-colors border border-white/[0.06] rounded-md px-2.5 py-1.5">
          Change avatar
        </button>
      </div>

      <div className="bg-surface-1 border border-white/[0.06] rounded-xl px-4">
        <Field label="Display name" hint="Shown in the session header">
          <TextInput value={name} onChange={setName} placeholder="Your name" />
        </Field>
        <Field label="Email" hint="Used for notifications">
          <TextInput value={email} onChange={setEmail} placeholder="email@domain.com" type="email" />
        </Field>
        <Field label="Bio" hint="Short description">
          <TextInput value={bio} onChange={setBio} placeholder="What do you build?" />
        </Field>
        <Field label="Role" hint="Account permission level">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-2xs font-mono rounded">
            <Shield size={10} /> admin
          </span>
        </Field>
      </div>
    </div>
  );
};

const SectionAppearance = () => {
  const [theme, setTheme]   = useState('dark');
  const [accent, setAccent] = useState('blue');
  const [density, setDensity] = useState('comfortable');
  const [animations, setAnimations] = useState(true);
  const s = useSave();

  const accents = [
    { id: 'blue',   color: '#3b82f6' },
    { id: 'cyan',   color: '#22d3ee' },
    { id: 'green',  color: '#22c55e' },
    { id: 'purple', color: '#a78bfa' },
    { id: 'amber',  color: '#f59e0b' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Appearance</h2>
          <p className="text-2xs font-mono text-slate-600 mt-0.5">Theme, density, and visual preferences</p>
        </div>
        <SaveBtn saving={s.saving} saved={s.saved} onClick={s.trigger} />
      </div>

      {/* Theme tiles */}
      <div className="mb-4">
        <div className="text-2xs font-mono text-slate-600 uppercase tracking-widest mb-3">Theme</div>
        <div className="flex gap-3">
          {['dark', 'darker', 'midnight'].map(t => (
            <button key={t} onClick={() => setTheme(t)}
              className={`flex-1 py-3 rounded-xl border text-2xs font-mono transition-all duration-100
                ${theme === t ? 'border-accent-blue/40 bg-accent-blue/8 text-accent-blue' : 'border-white/[0.06] bg-surface-2 text-slate-600 hover:text-slate-400'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Accent palette */}
      <div className="mb-4">
        <div className="text-2xs font-mono text-slate-600 uppercase tracking-widest mb-3">Accent color</div>
        <div className="flex gap-2">
          {accents.map(a => (
            <button key={a.id} onClick={() => setAccent(a.id)}
              className={`w-7 h-7 rounded-full border-2 transition-all duration-100
                ${accent === a.id ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-90'}`}
              style={{ backgroundColor: a.color }} />
          ))}
        </div>
      </div>

      <div className="bg-surface-1 border border-white/[0.06] rounded-xl px-4">
        <Field label="Information density" hint="Controls padding and spacing across the UI">
          <div className="flex gap-1 bg-surface-2 rounded-lg p-0.5">
            {['compact', 'comfortable', 'spacious'].map(d => (
              <button key={d} onClick={() => setDensity(d)}
                className={`px-2.5 py-1 rounded text-2xs font-mono transition-colors duration-100
                  ${density === d ? 'bg-accent-blue/15 text-accent-blue' : 'text-slate-600 hover:text-slate-400'}`}>
                {d}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Animations" hint="Disable for reduced motion">
          <Toggle on={animations} onChange={setAnimations} />
        </Field>
      </div>
    </div>
  );
};

const SectionNotifications = () => {
  const [prefs, setPrefs] = useState({
    containerEvents: true, healthAlerts: true, deployments: true,
    weeklyReport: false, securityAlerts: true, browser: false,
  });
  const s = useSave();
  const toggle = k => setPrefs(p => ({ ...p, [k]: !p[k] }));

  const rows = [
    { k: 'containerEvents', label: 'Container lifecycle events', hint: 'start, stop, restart, crash' },
    { k: 'healthAlerts',    label: 'Health degradation alerts',  hint: 'CPU, memory threshold breaches' },
    { k: 'deployments',     label: 'Deployment notifications',   hint: 'pull, create, remove operations' },
    { k: 'securityAlerts',  label: 'Security scan results',      hint: 'CVE detections, posture changes' },
    { k: 'weeklyReport',    label: 'Weekly summary digest',      hint: 'emailed every Monday 09:00' },
    { k: 'browser',         label: 'Browser push notifications', hint: 'requires permission grant' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Notifications</h2>
          <p className="text-2xs font-mono text-slate-600 mt-0.5">Control which events trigger alerts</p>
        </div>
        <SaveBtn saving={s.saving} saved={s.saved} onClick={s.trigger} />
      </div>
      <div className="bg-surface-1 border border-white/[0.06] rounded-xl px-4">
        {rows.map(r => (
          <Field key={r.k} label={r.label} hint={r.hint}>
            <Toggle on={prefs[r.k]} onChange={() => toggle(r.k)} />
          </Field>
        ))}
      </div>
    </div>
  );
};

const SectionDocker = () => {
  const [socket, setSocket]   = useState('/var/run/docker.sock');
  const [timeout, setTimeout2] = useState('30');
  const [tlsVerify, setTls]   = useState(true);
  const [metrics, setMetrics] = useState(true);
  const [interval, setInterval2] = useState('60');
  const s = useSave();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Docker Preferences</h2>
          <p className="text-2xs font-mono text-slate-600 mt-0.5">Daemon connection and telemetry settings</p>
        </div>
        <SaveBtn saving={s.saving} saved={s.saved} onClick={s.trigger} />
      </div>
      <div className="bg-surface-1 border border-white/[0.06] rounded-xl px-4">
        <Field label="Socket path" hint="Docker daemon Unix socket">
          <TextInput value={socket} onChange={setSocket} placeholder="/var/run/docker.sock" mono />
        </Field>
        <Field label="API timeout" hint="Seconds before request fails">
          <TextInput value={timeout} onChange={setTimeout2} placeholder="30" mono />
        </Field>
        <Field label="TLS verification" hint="Verify daemon TLS certificate">
          <Toggle on={tlsVerify} onChange={setTls} />
        </Field>
        <Field label="Metrics collection" hint="Enable telemetry persistence to MongoDB">
          <Toggle on={metrics} onChange={setMetrics} />
        </Field>
        <Field label="Collection interval" hint="Seconds between metric snapshots">
          <TextInput value={interval} onChange={setInterval2} placeholder="60" mono />
        </Field>
      </div>
    </div>
  );
};

const SectionApiKeys = () => {
  const [keys, setKeys] = useState([
    { id: 'k1', name: 'CLI Access',       prefix: 'dok_live_xK9m', created: '2026-04-01', last: '2h ago'  },
    { id: 'k2', name: 'CI/CD Pipeline',   prefix: 'dok_live_pR3n', created: '2026-03-15', last: '1d ago'  },
  ]);
  const [reveal, setReveal] = useState({});
  const [newName, setNewName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);

  const generate = () => {
    if (!newName.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      const id = `k${Date.now()}`;
      setKeys(prev => [...prev, { id, name: newName, prefix: `dok_live_${Math.random().toString(36).slice(2,6)}`, created: new Date().toISOString().slice(0,10), last: 'just now' }]);
      setNewName(''); setGenerating(false);
    }, 900);
  };

  const copy = (id, val) => { navigator.clipboard?.writeText(val); setCopied(id); setTimeout(() => setCopied(null), 2000); };
  const del  = id => setKeys(prev => prev.filter(k => k.id !== id));

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-white">API Keys</h2>
        <p className="text-2xs font-mono text-slate-600 mt-0.5">Manage programmatic access tokens</p>
      </div>

      {/* Existing keys */}
      <div className="space-y-2 mb-4">
        {keys.map(k => (
          <div key={k.id} className="flex items-center gap-3 p-3 bg-surface-1 border border-white/[0.06] rounded-xl">
            <Key size={13} className="text-slate-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">{k.name}</div>
              <div className="text-2xs font-mono text-slate-600 mt-0.5">
                {reveal[k.id] ? `${k.prefix}••••••••••••` : '••••••••••••••••••••'}
                <span className="ml-3">Created {k.created}</span>
                <span className="ml-3">Last used {k.last}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setReveal(r => ({ ...r, [k.id]: !r[k.id] }))}
                className="p-1.5 text-slate-600 hover:text-slate-300 transition-colors rounded">
                {reveal[k.id] ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button onClick={() => copy(k.id, k.prefix)}
                className="p-1.5 text-slate-600 hover:text-accent-blue transition-colors rounded">
                {copied === k.id ? <Check size={13} className="text-accent-green" /> : <Copy size={13} />}
              </button>
              <button onClick={() => del(k.id)}
                className="p-1.5 text-slate-600 hover:text-accent-red transition-colors rounded">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Generate new */}
      <div className="flex items-center gap-2 p-3 bg-surface-1 border border-dashed border-white/[0.08] rounded-xl">
        <input value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()}
          placeholder="Key name (e.g. Staging Deploy)"
          className="flex-1 bg-transparent text-sm text-slate-300 placeholder:text-slate-700 focus:outline-none font-mono" />
        <button onClick={generate} disabled={!newName.trim() || generating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue/10 border border-accent-blue/25 text-accent-blue text-2xs font-mono hover:bg-accent-blue/15 transition-colors disabled:opacity-40">
          {generating ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
          Generate
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-2xs font-mono text-slate-700">
        <AlertTriangle size={11} className="text-amber-500/60" />
        Keys are shown once at generation. Store them securely.
      </div>
    </div>
  );
};

const SectionIntegrations = () => {
  const [githubConnected, setGithub] = useState(true);
  const [slackConnected, setSlack]   = useState(false);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-white">Integrations</h2>
        <p className="text-2xs font-mono text-slate-600 mt-0.5">Third-party connections and webhooks</p>
      </div>
      <div className="space-y-3">
        {[
          {
            name: 'GitHub', desc: 'Sync repos, trigger deployments',
            connected: githubConnected, toggle: () => setGithub(v => !v),
            icon: <GitBranch size={18} className="text-white" />,
            meta: githubConnected ? 'Connected as @himanshu2631' : 'Not connected',
          },
          {
            name: 'Slack', desc: 'Send alerts to channels',
            connected: slackConnected, toggle: () => setSlack(v => !v),
            icon: <Bell size={18} className="text-purple-400" />,
            meta: slackConnected ? 'Workspace: devops-team' : 'Not connected',
          },
          {
            name: 'Webhook', desc: 'POST events to external endpoints',
            connected: false, toggle: () => {},
            icon: <Puzzle size={18} className="text-amber-400" />,
            meta: 'Configure endpoints',
          },
        ].map(item => (
          <div key={item.name} className="flex items-center gap-4 p-4 bg-surface-1 border border-white/[0.06] rounded-xl hover:border-white/[0.1] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">{item.name}</div>
              <div className="text-2xs font-mono text-slate-600">{item.desc}</div>
              <div className={`text-2xs font-mono mt-0.5 ${item.connected ? 'text-accent-green' : 'text-slate-700'}`}>{item.meta}</div>
            </div>
            <button onClick={item.toggle}
              className={`px-3 py-1.5 rounded-lg text-2xs font-mono border transition-colors duration-100 ${
                item.connected
                  ? 'border-white/[0.06] text-slate-500 hover:text-accent-red hover:border-red-500/20'
                  : 'border-accent-blue/25 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/15'}`}>
              {item.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionSessions = () => (
  <div>
    <div className="mb-5">
      <h2 className="text-base font-semibold text-white">Connected Devices</h2>
      <p className="text-2xs font-mono text-slate-600 mt-0.5">Active sessions and device management</p>
    </div>
    <div className="space-y-2">
      {[
        { device: 'Windows 11 · Chrome 124', ip: '192.168.1.10', location: 'Local',    current: true,  last: 'Now'       },
        { device: 'macOS · Safari 17',       ip: '10.0.0.22',   location: 'Remote',   current: false, last: '2d ago'    },
        { device: 'Ubuntu · Firefox 125',    ip: '172.16.0.5',  location: 'Network',  current: false, last: '5d ago'    },
      ].map((s, i) => (
        <div key={i} className={`flex items-center gap-4 p-3.5 rounded-xl border transition-colors ${s.current ? 'bg-accent-blue/5 border-accent-blue/15' : 'bg-surface-1 border-white/[0.06] hover:border-white/[0.1]'}`}>
          <div className="w-9 h-9 rounded-lg bg-surface-2 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
            {s.current ? <Monitor size={15} className="text-accent-blue" /> : <Smartphone size={15} className="text-slate-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{s.device}</span>
              {s.current && <span className="text-2xs font-mono px-1.5 py-0.5 bg-accent-green/10 border border-green-500/15 text-accent-green rounded">current</span>}
            </div>
            <div className="text-2xs font-mono text-slate-600 mt-0.5">{s.ip} · {s.location} · Last active: {s.last}</div>
          </div>
          {!s.current && (
            <button className="p-1.5 text-slate-600 hover:text-accent-red transition-colors rounded">
              <LogOut size={13} />
            </button>
          )}
        </div>
      ))}
    </div>
    <button className="mt-3 w-full py-2 rounded-xl border border-white/[0.05] text-2xs font-mono text-slate-700 hover:text-accent-red hover:border-red-500/15 transition-colors">
      Revoke all other sessions
    </button>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'profile',       label: 'Profile',            icon: User       },
  { id: 'appearance',    label: 'Appearance',          icon: Palette    },
  { id: 'notifications', label: 'Notifications',       icon: Bell       },
  { id: 'docker',        label: 'Docker Preferences',  icon: Container  },
  { id: 'apikeys',       label: 'API Keys',            icon: Key        },
  { id: 'integrations',  label: 'Integrations',        icon: Puzzle     },
  { id: 'sessions',      label: 'Connected Devices',   icon: Monitor    },
];

const VIEWS = {
  profile:       SectionProfile,
  appearance:    SectionAppearance,
  notifications: SectionNotifications,
  docker:        SectionDocker,
  apikeys:       SectionApiKeys,
  integrations:  SectionIntegrations,
  sessions:      SectionSessions,
};

const SettingsView = () => {
  const [active, setActive] = useState('profile');
  const View = VIEWS[active];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="pb-16"
    >
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-1.5 py-0.5 bg-slate-500/10 text-slate-400 text-2xs font-semibold rounded border border-slate-500/20 uppercase tracking-widest">Settings</span>
          <span className="text-slate-600 text-2xs font-mono">/ {active}</span>
        </div>
        <h1 className="text-xl font-semibold text-white tracking-tight">Settings</h1>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar nav */}
        <nav className="w-[200px] flex-shrink-0 bg-surface-1 border border-white/[0.06] rounded-xl p-1.5 sticky top-4">
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-100 text-left
                  ${isActive ? 'bg-accent-blue/10 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'}`}>
                <Icon size={14} className={isActive ? 'text-accent-blue' : 'text-slate-600'} />
                <span className="font-medium truncate">{item.label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto text-accent-blue/60" />}
              </button>
            );
          })}
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }} transition={{ duration: 0.14 }}
            >
              <View />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsView;
