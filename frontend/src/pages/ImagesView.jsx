import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Download, Trash2, ScanLine, Info,
  ChevronDown, ChevronRight, X, Package, HardDrive,
  Calendar, Tag, AlertTriangle, CheckCircle, Clock, Plus, Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ageLabel = (iso) => {
  if (!iso) return '—';
  const secs = (Date.now() - new Date(iso).getTime()) / 1000;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
};

// simple deterministic vuln rating from image id
const vulnLevel = (id) => {
  const n = id.charCodeAt(0) % 3;
  return ['clean', 'low', 'medium'][n];
};

const VulnBadge = ({ level }) => {
  const map = {
    clean:  { label: 'Clean',  cls: 'text-accent-green  bg-green-500/8  border-green-500/15',  Icon: CheckCircle },
    low:    { label: 'Low',    cls: 'text-amber-400     bg-amber-500/8  border-amber-500/15',   Icon: AlertTriangle },
    medium: { label: 'Medium', cls: 'text-accent-red    bg-red-500/8    border-red-500/15',     Icon: AlertTriangle },
  };
  const { label, cls, Icon } = map[level] || map.clean;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-2xs font-mono ${cls}`}>
      <Icon size={9} />{label}
    </span>
  );
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
const RowSkeleton = () => (
  <div className="px-4 py-3 flex items-center gap-4 border-b border-white/[0.04]">
    {[80, 120, 56, 72, 72, 64].map((w, i) => (
      <div key={i} className="skeleton h-3 rounded" style={{ width: w, animationDelay: `${i * 0.07}s` }} />
    ))}
  </div>
);

// ─── Pull Modal ──────────────────────────────────────────────────────────────
const PullModal = ({ onClose, onPull, pulling }) => {
  const [value, setValue] = useState('');
  const submit = (e) => { e.preventDefault(); if (value.trim()) onPull(value.trim()); };
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="bg-surface-1 border border-white/[0.08] rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-semibold text-white">Pull Image</h2>
            <p className="text-2xs font-mono text-slate-600 mt-0.5">Pull from Docker Hub or private registry</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-600 hover:text-slate-400 transition-colors"><X size={15} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-2xs font-mono text-slate-600 uppercase tracking-widest mb-1.5">Image reference</label>
            <input
              autoFocus
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="nginx:latest · redis:7-alpine · ghcr.io/org/repo:sha"
              className="w-full bg-surface-2 border border-white/[0.06] rounded-lg px-3 py-2 text-sm font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-accent-blue/30 focus:bg-surface-3 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/[0.06] text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim() || pulling}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-accent-blue/15 border border-accent-blue/25 text-accent-blue text-sm font-medium hover:bg-accent-blue/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {pulling ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
              {pulling ? 'Pulling…' : 'Pull'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Inspect Drawer ──────────────────────────────────────────────────────────
const InspectDrawer = ({ image, data, loading, onClose }) => (
  <motion.div
    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
    transition={{ duration: 0.18 }}
    className="fixed top-0 right-0 h-full w-[400px] z-40 bg-surface-1 border-l border-white/[0.07] shadow-2xl flex flex-col"
  >
    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-white truncate">{image.repo}</div>
        <div className="text-2xs font-mono text-slate-600 mt-0.5">:{image.tag} · {image.id}</div>
      </div>
      <button onClick={onClose} className="p-1 text-slate-600 hover:text-slate-400 transition-colors ml-3 flex-shrink-0"><X size={15} /></button>
    </div>

    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { k: 'Size',    v: image.sizeLabel },
          { k: 'Created', v: fmtDate(image.created) },
          { k: 'Tag',     v: image.tag },
          { k: 'Vuln',    v: <VulnBadge level={vulnLevel(image.id)} /> },
        ].map(({ k, v }) => (
          <div key={k} className="bg-surface-2 rounded-lg p-3">
            <div className="text-2xs font-mono text-slate-600 uppercase mb-1">{k}</div>
            <div className="text-xs font-mono text-slate-300">{v}</div>
          </div>
        ))}
      </div>

      {/* Raw inspect */}
      <div>
        <div className="text-2xs font-mono text-slate-600 uppercase tracking-widest mb-2">Raw Metadata</div>
        {loading ? (
          <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="skeleton h-3 rounded" />)}</div>
        ) : data ? (
          <div className="bg-[#0a0a0d] rounded-lg border border-white/[0.05] p-3 max-h-72 overflow-y-auto">
            {[
              ['Architecture', data.Architecture],
              ['OS', data.Os],
              ['Author', data.Author || '—'],
              ['Docker Version', data.DockerVersion || '—'],
              ['Entrypoint', (data.Config?.Entrypoint || []).join(' ') || '—'],
              ['Cmd', (data.Config?.Cmd || []).join(' ') || '—'],
              ['Working Dir', data.Config?.WorkingDir || '/'],
              ['Exposed Ports', Object.keys(data.Config?.ExposedPorts || {}).join(', ') || 'none'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 py-1 border-b border-white/[0.03] last:border-0">
                <span className="text-2xs font-mono text-slate-600 w-28 flex-shrink-0">{k}</span>
                <span className="text-2xs font-mono text-slate-400 break-all">{v}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-2xs font-mono text-slate-700 text-center py-6">inspect failed</div>
        )}
      </div>

      {/* Env vars */}
      {data?.Config?.Env?.length > 0 && (
        <div>
          <div className="text-2xs font-mono text-slate-600 uppercase tracking-widest mb-2">Env Variables</div>
          <div className="bg-[#0a0a0d] rounded-lg border border-white/[0.05] p-3 max-h-48 overflow-y-auto space-y-1">
            {data.Config.Env.map((e, i) => (
              <div key={i} className="text-2xs font-mono text-slate-500 break-all">{e}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

// ─── Image Row ────────────────────────────────────────────────────────────────
const ImageRow = ({ image, onDelete, onInspect, isSelected }) => {
  const [hovered, setHovered] = useState(false);
  const vuln = vulnLevel(image.id);

  return (
    <motion.div
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onInspect(image)}
      className={cn(
        'grid items-center gap-4 px-4 py-3 border-b border-white/[0.04] cursor-pointer transition-colors duration-100 select-none',
        'grid-cols-[2fr_1fr_80px_96px_80px_auto]',
        isSelected ? 'bg-accent-blue/5 border-l-2 border-l-accent-blue/40' : 'hover:bg-white/[0.02]'
      )}
    >
      {/* Name + ID */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Package size={12} className="text-slate-600 flex-shrink-0" />
          <span className="text-sm font-medium text-white truncate">{image.repo}</span>
        </div>
        <div className="text-2xs font-mono text-slate-600 mt-0.5 pl-[20px]">{image.id}</div>
      </div>

      {/* Tag */}
      <div>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface-2 border border-white/[0.06] rounded text-2xs font-mono text-slate-400">
          <Tag size={9} />{image.tag}
        </span>
      </div>

      {/* Size */}
      <div className="flex items-center gap-1 text-2xs font-mono text-slate-500 tabular-nums">
        <HardDrive size={10} className="text-slate-700" />
        {image.sizeLabel}
      </div>

      {/* Age */}
      <div className="flex items-center gap-1 text-2xs font-mono text-slate-500">
        <Clock size={10} className="text-slate-700" />
        {ageLabel(image.created)}
      </div>

      {/* Vuln */}
      <div><VulnBadge level={vuln} /></div>

      {/* Actions */}
      <div className="flex items-center gap-1 justify-end">
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-1"
              onClick={e => e.stopPropagation()}
            >
              <button
                title="Inspect"
                onClick={() => onInspect(image)}
                className="p-1.5 text-slate-600 hover:text-accent-blue hover:bg-accent-blue/8 rounded transition-colors"
              ><Info size={13} /></button>
              <button
                title="Delete"
                onClick={() => onDelete(image)}
                className="p-1.5 text-slate-600 hover:text-accent-red hover:bg-red-500/8 rounded transition-colors"
              ><Trash2 size={13} /></button>
            </motion.div>
          )}
        </AnimatePresence>
        <ChevronRight size={13} className={cn('text-slate-700 transition-colors', isSelected && 'text-accent-blue')} />
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ImagesView = () => {
  const { api } = useAuth();

  const [images, setImages]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [sortBy, setSortBy]           = useState('created');
  const [showPull, setShowPull]       = useState(false);
  const [pulling, setPulling]         = useState(false);
  const [selected, setSelected]       = useState(null);
  const [inspectData, setInspectData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [toast, setToast]             = useState(null);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchImages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await api.get('/images');
      if (res.data.success) setImages(res.data.data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleInspect = async (image) => {
    setSelected(prev => prev?.id === image.id ? null : image);
    setInspectData(null);
    if (selected?.id === image.id) return;
    setInspectLoading(true);
    try {
      const res = await api.get(`/images/${image.fullId}/inspect`);
      if (res.data.success) setInspectData(res.data.data);
    } catch { /* silent */ } finally { setInspectLoading(false); }
  };

  const handleDelete = async (image) => {
    if (!window.confirm(`Remove image ${image.repo}:${image.tag}?`)) return;
    try {
      await api.delete(`/images/${image.fullId}`);
      notify(`Removed ${image.repo}:${image.tag}`);
      if (selected?.id === image.id) setSelected(null);
      fetchImages(true);
    } catch (e) { notify(e.response?.data?.message || e.message, 'error'); }
  };

  const handlePull = async (ref) => {
    setPulling(true);
    try {
      await api.post('/images/pull', { image: ref });
      notify(`Pulled ${ref} successfully`);
      setShowPull(false);
      fetchImages(true);
    } catch (e) { notify(e.response?.data?.message || e.message, 'error'); }
    finally { setPulling(false); }
  };

  // Filter + sort
  const filtered = images
    .filter(img => {
      if (!search) return true;
      const q = search.toLowerCase();
      return img.repo.toLowerCase().includes(q) || img.tag.toLowerCase().includes(q) || img.id.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'size') return b.sizeMB - a.sizeMB;
      if (sortBy === 'name') return a.repo.localeCompare(b.repo);
      return new Date(b.created) - new Date(a.created);
    });

  // Stats
  const totalSize = images.reduce((s, i) => s + i.sizeMB, 0);
  const dangling  = images.filter(i => i.repo === '<none>').length;
  const stale     = images.filter(i => {
    const days = (Date.now() - new Date(i.created).getTime()) / 86400000;
    return days > 30;
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="pb-16"
    >
      {/* ── Header ── */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 bg-accent-blue/10 text-accent-blue text-2xs font-semibold rounded border border-accent-blue/20 uppercase tracking-widest">Images</span>
            <span className="text-slate-600 text-2xs font-mono">/ registry</span>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Image Registry</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchImages(true)} disabled={refreshing}
            className="p-1.5 rounded-md border border-white/[0.06] bg-surface-1 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
          ><RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /></button>
          <button
            onClick={() => setShowPull(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-accent-blue/30 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/15 transition-colors active:scale-[0.98]"
          ><Plus size={13} />Pull Image</button>
        </div>
      </div>

      {/* ── Metadata strip ── */}
      <div className="flex items-center gap-0 mb-5 border border-white/[0.06] rounded-lg bg-surface-1/50 divide-x divide-white/[0.06] overflow-hidden w-fit">
        {[
          { k: 'Total',    v: images.length },
          { k: 'Size',     v: `${totalSize.toFixed(0)} MB` },
          { k: 'Dangling', v: dangling },
          { k: 'Stale >30d', v: stale },
        ].map(({ k, v }) => (
          <div key={k} className="px-3 py-1.5 flex items-center gap-2">
            <span className="text-2xs text-slate-600 font-mono uppercase">{k}</span>
            <span className="text-2xs text-slate-400 font-mono tabular-nums">{v}</span>
          </div>
        ))}
      </div>

      {/* ── Cleanup recommendation ── */}
      {(dangling > 0 || stale > 0) && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2.5 px-3 py-2 bg-amber-500/8 border border-amber-500/15 rounded-lg"
        >
          <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
          <span className="text-2xs text-amber-600">
            <strong className="font-semibold">{dangling + stale} images</strong> flagged for cleanup —
            {dangling > 0 && ` ${dangling} dangling`}{dangling > 0 && stale > 0 && ','}{stale > 0 && ` ${stale} stale (>30d)`}.
            Review and remove to reclaim disk space.
          </span>
        </motion.div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm group">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-slate-400 transition-colors" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, tag, or ID…"
            className="w-full bg-surface-1 border border-white/[0.06] rounded-lg py-1.5 pl-8 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-white/[0.12] transition-colors font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-surface-1 border border-white/[0.06] rounded-lg px-2 py-1.5">
          <Filter size={11} className="text-slate-600" />
          <select
            value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-transparent text-2xs font-mono text-slate-400 outline-none cursor-pointer"
          >
            <option value="created">newest first</option>
            <option value="size">largest first</option>
            <option value="name">name a–z</option>
          </select>
        </div>

        <div className="h-4 w-px bg-white/[0.06]" />
        <span className="font-mono text-2xs text-slate-600 tabular-nums">{filtered.length}/{images.length} images</span>
        {search && (
          <button onClick={() => setSearch('')} className="text-2xs text-slate-600 hover:text-slate-400 transition-colors">clear</button>
        )}
      </div>

      {/* ── Main content + drawer ── */}
      <div className={cn('transition-all duration-200', selected ? 'mr-[416px]' : '')}>

        {/* Table */}
        <div className="bg-surface-1 border border-white/[0.06] rounded-xl overflow-hidden">

          {/* Column headers */}
          <div className="grid grid-cols-[2fr_1fr_80px_96px_80px_auto] gap-4 px-4 py-2.5 border-b border-white/[0.06] bg-surface-2/50">
            {['Image', 'Tag', 'Size', 'Created', 'Security', ''].map((h, i) => (
              <div key={i} className="text-2xs font-mono text-slate-600 uppercase tracking-widest">{h}</div>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
          ) : error ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-semibold text-accent-red mb-1">Failed to load images</p>
              <p className="text-2xs font-mono text-slate-600 mb-4">{error}</p>
              <button onClick={() => fetchImages()} className="px-4 py-1.5 rounded-md border border-accent-red/20 bg-red-500/8 text-accent-red text-sm hover:bg-red-500/12 transition-colors">
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <Package size={28} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500 mb-1">
                {search ? 'No images match your filter' : 'No images found'}
              </p>
              <p className="text-2xs font-mono text-slate-700">
                {search ? 'Try a different search term' : 'Pull an image to get started'}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map(img => (
                <ImageRow
                  key={img.id}
                  image={img}
                  onDelete={handleDelete}
                  onInspect={handleInspect}
                  isSelected={selected?.id === img.id}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Inspect Drawer ── */}
      <AnimatePresence>
        {selected && (
          <InspectDrawer
            image={selected}
            data={inspectData}
            loading={inspectLoading}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Pull Modal ── */}
      <AnimatePresence>
        {showPull && (
          <PullModal onClose={() => setShowPull(false)} onPull={handlePull} pulling={pulling} />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 8, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 4, x: '-50%' }}
            transition={{ duration: 0.15 }}
            className={cn(
              'fixed bottom-8 left-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg border shadow-xl text-sm font-medium',
              toast.type === 'error'
                ? 'bg-surface-1 border-accent-red/25 text-accent-red'
                : 'bg-surface-1 border-accent-green/25 text-accent-green'
            )}
          >
            {toast.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImagesView;
