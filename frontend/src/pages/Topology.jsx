import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  BaseEdge,
  getBezierPath,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Database, Activity, Server, Cpu, HardDrive,
  Globe, Search, Plus, Minus, Maximize,
  Layers, Info, Link2, Zap
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

// --- Tooltip ---
const NodeTooltip = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.12 }}
    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none"
  >
    <div className="bg-surface-1 border border-white/[0.08] rounded-lg p-3 shadow-xl min-w-[180px]">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/[0.06]">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${data.status === 'running' ? 'bg-accent-green' : 'bg-accent-red'}`} />
        <span className="text-xs font-semibold text-white truncate">{data.label}</span>
        <span className="text-2xs font-mono text-slate-600 ml-auto">{data.shortId}</span>
      </div>
      <div className="space-y-1.5">
        {[
          { k: 'Image', v: data.image },
          { k: 'Ports', v: data.ports },
          { k: 'Uptime', v: data.uptime },
        ].map(({ k, v }) => (
          <div key={k} className="flex justify-between items-center gap-4">
            <span className="text-2xs text-slate-600 font-mono uppercase">{k}</span>
            <span className="text-2xs text-slate-400 font-mono truncate max-w-[110px]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

// --- Gateway Node ---
const GatewayNode = ({ data }) => (
  <div className="relative group">
    <div className="w-20 h-20 rounded-full bg-surface-2 border border-white/[0.1] flex flex-col items-center justify-center gap-1.5 transition-colors duration-200 group-hover:border-accent-blue/30">
      <Globe size={20} className="text-accent-blue opacity-70" />
      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Gateway</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-slate-600 !border-none !w-1.5 !h-1.5" />
  </div>
);

// --- Edge ---
const GlowingEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const isRunning = data?.status === 'running';
  const load = parseFloat(data?.load || '0');
  const edgeColor = isRunning ? (style.stroke || '#3b82f6') : '#374151';
  const flowDuration = load > 5 ? '1.2s' : load > 2 ? '2s' : '3.5s';

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, strokeWidth: 1, stroke: edgeColor, opacity: isRunning ? 0.25 : 0.1 }}
      />
      {isRunning && (
        <path
          d={edgePath}
          fill="none"
          stroke={edgeColor}
          strokeWidth={1.5}
          strokeDasharray="5, 18"
          className="topo-flowing-edge"
          style={{ animationDuration: flowDuration, opacity: 0.55 }}
        />
      )}
    </>
  );
};

// --- Container Node ---
const ContainerNode = ({ data }) => {
  const isRunning = data.status === 'running';
  const [showTooltip, setShowTooltip] = useState(false);

  const typeConfig = {
    database:   { icon: Database,  color: 'text-amber-400',   bg: 'bg-amber-500/8',   border: 'border-amber-500/15' },
    frontend:   { icon: Globe,     color: 'text-accent-cyan', bg: 'bg-cyan-500/8',    border: 'border-cyan-500/15' },
    monitoring: { icon: Activity,  color: 'text-accent-green',bg: 'bg-green-500/8',   border: 'border-green-500/15' },
    cache:      { icon: Cpu,       color: 'text-purple-400',  bg: 'bg-purple-500/8',  border: 'border-purple-500/15' },
    backend:    { icon: Server,    color: 'text-accent-blue', bg: 'bg-blue-500/8',    border: 'border-blue-500/15' },
    service:    { icon: Network,   color: 'text-slate-400',   bg: 'bg-slate-500/8',   border: 'border-slate-500/15' },
  };
  const cfg = typeConfig[data.type] || typeConfig.service;
  const Icon = cfg.icon;

  const cpuVal = parseFloat(data.cpu) || 0;
  const memVal = parseFloat(data.memPercent) || 40;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <AnimatePresence>{showTooltip && <NodeTooltip data={data} />}</AnimatePresence>

      <Handle type="target" position={Position.Top} className="!bg-slate-700 !border-none !w-1 !h-1" />

      <div
        className={`
          bg-surface-1 border rounded-xl transition-all duration-150 min-w-[200px] max-w-[220px]
          ${isRunning
            ? `border-white/[0.07] group-hover:border-white/[0.12] ${data.isPulsing ? 'topo-event-flash' : ''}`
            : 'border-white/[0.04] opacity-50'}
        `}
      >
        {/* Node header */}
        <div className="flex items-center gap-2.5 px-3 pt-3 pb-2.5">
          <div className={`p-1.5 rounded-lg border ${cfg.bg} ${cfg.border} ${cfg.color} flex-shrink-0`}>
            <Icon size={14} />
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate leading-tight">{data.label}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1 h-1 rounded-full flex-shrink-0 ${isRunning ? 'bg-accent-green' : 'bg-slate-600'}`} />
              <span className="text-2xs font-mono text-slate-600 truncate">{data.status} · {data.type}</span>
            </div>
          </div>
        </div>

        {/* Telemetry */}
        <div className="px-3 pb-3 border-t border-white/[0.05] pt-2.5 grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Cpu size={9} className="text-slate-600" />
              <span className="text-2xs font-mono text-slate-600 uppercase">CPU</span>
            </div>
            <div className="h-0.5 bg-surface-3 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-accent-blue/60 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(cpuVal * 10, 100)}%` }}
              />
            </div>
            <span className="text-2xs font-mono text-slate-400 tabular-nums">{data.cpu || '0.00%'}</span>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <HardDrive size={9} className="text-slate-600" />
              <span className="text-2xs font-mono text-slate-600 uppercase">MEM</span>
            </div>
            <div className="h-0.5 bg-surface-3 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-purple-500/50 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(memVal, 100)}%` }}
              />
            </div>
            <span className="text-2xs font-mono text-slate-400 tabular-nums">{data.mem || '0 MB'}</span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-slate-700 !border-none !w-1 !h-1" />
    </div>
  );
};

// --- Main Topology ---
const TopologyContent = ({ containers = [] }) => {
  const { isConnected, realTimeStats, lastEvent } = useSocket();
  const { zoomIn, zoomOut, fitView, setCenter } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayers, setActiveLayers] = useState(['frontend', 'backend', 'database', 'cache', 'monitoring', 'service']);
  const [pulsingNodes, setPulsingNodes] = useState(new Set());

  const positionsRef = useRef({});

  const nodeTypes = useMemo(() => ({ container: ContainerNode, gateway: GatewayNode }), []);
  const edgeTypes = useMemo(() => ({ glowing: GlowingEdge }), []);

  useEffect(() => {
    if (lastEvent?.type === 'container') {
      const id = lastEvent.actorId;
      setPulsingNodes(prev => new Set([...prev, id]));
      setTimeout(() => setPulsingNodes(prev => { const n = new Set(prev); n.delete(id); return n; }), 2000);
    }
  }, [lastEvent]);

  useEffect(() => {
    if (searchQuery && nodes.length > 0) {
      const match = nodes.find(n =>
        n.data?.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.data?.image?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match) setCenter(match.position.x + 110, match.position.y + 60, { zoom: 1.3, duration: 600 });
    }
  }, [searchQuery, nodes, setCenter]);

  const getContainerType = (name, image) => {
    const s = (name + image).toLowerCase();
    if (s.includes('db') || s.includes('mongo') || s.includes('sql') || s.includes('postgres')) return 'database';
    if (s.includes('redis') || s.includes('memcached') || s.includes('cache')) return 'cache';
    if (s.includes('front') || s.includes('web') || s.includes('app') || s.includes('ui') || s.includes('react') || s.includes('next')) return 'frontend';
    if (s.includes('api') || s.includes('back') || s.includes('server') || s.includes('node') || s.includes('express')) return 'backend';
    if (s.includes('prom') || s.includes('grafana') || s.includes('log') || s.includes('monitor') || s.includes('health')) return 'monitoring';
    return 'service';
  };

  const buildGraph = useCallback(() => {
    if (!containers) return;
    let fc = containers;
    if (filter === 'running') fc = containers.filter(c => c.State === 'running');
    if (filter === 'stopped') fc = containers.filter(c => c.State !== 'running');
    fc = fc.filter(c => activeLayers.includes(getContainerType(c.Names[0], c.Image)));

    const gatewayNode = {
      id: 'gateway', type: 'gateway',
      data: { label: 'External Gateway' },
      position: { x: 480, y: -80 }
    };

    const spacing = containers.length > 10 ? 240 : 300;
    const layerY = { gateway: -80, frontend: 120, backend: 380, database: 640, cache: 640, monitoring: 380, service: 380 };

    const containerNodes = fc.map(c => {
      const type = getContainerType(c.Names[0], c.Image);
      const hasPublicPorts = c.Ports && c.Ports.some(p => p.PublicPort);
      if (!positionsRef.current[c.Id]) {
        const nodesInLayer = fc.filter(nc => getContainerType(nc.Names[0], nc.Image) === type);
        const idx = nodesInLayer.findIndex(nc => nc.Id === c.Id);
        const total = nodesInLayer.length;
        const offset = (total - 1) * spacing / 2;
        let x = 480 + (idx * spacing) - offset;
        if (type === 'monitoring') x += 550;
        if (type === 'cache') x -= 350;
        positionsRef.current[c.Id] = { x, y: layerY[type] || 380 };
      }
      return {
        id: c.Id, type: 'container',
        data: {
          label: c.Names[0]?.replace('/', '') || 'unknown',
          status: c.State, type,
          shortId: c.Id.substring(0, 8),
          cpu: '0%', mem: '0 MB', memPercent: '40',
          image: c.Image, uptime: c.Status,
          hasPublicPorts,
          isPulsing: pulsingNodes.has(c.Id),
          load: realTimeStats?.telemetry.cpu || 0,
          ports: c.Ports?.[0] ? `${c.Ports[0].PublicPort || ''}:${c.Ports[0].PrivatePort}` : 'internal'
        },
        position: positionsRef.current[c.Id]
      };
    });

    const newEdges = [];
    const frontendNodes  = containerNodes.filter(n => n.data.type === 'frontend' || n.data.hasPublicPorts);
    const backendNodes   = containerNodes.filter(n => n.data.type === 'backend');
    const databaseNodes  = containerNodes.filter(n => n.data.type === 'database');
    const cacheNodes     = containerNodes.filter(n => n.data.type === 'cache');
    const monitoringNodes = containerNodes.filter(n => n.data.type === 'monitoring');
    const otherNodes     = containerNodes.filter(n => !['frontend','backend','database','cache','monitoring'].includes(n.data.type));

    const mkEdge = (id, source, target, color, statusA, statusB, load) => ({
      id, source, target, type: 'glowing',
      data: { status: statusA === 'running' && statusB === 'running' ? 'running' : 'stopped', load },
      style: { stroke: color }
    });

    frontendNodes.forEach(f => {
      newEdges.push(mkEdge(`g-f-${f.id}`, 'gateway', f.id, f.data.type === 'frontend' ? '#22d3ee' : '#3b82f6', 'running', f.data.status, f.data.load));
      if (f.data.type === 'frontend') {
        backendNodes.forEach(b => newEdges.push(mkEdge(`f-b-${f.id}-${b.id}`, f.id, b.id, '#3b82f6', f.data.status, b.data.status, f.data.load)));
      }
    });
    otherNodes.forEach(s => {
      if (!frontendNodes.find(f => f.id === s.id))
        newEdges.push(mkEdge(`g-s-${s.id}`, 'gateway', s.id, '#4b5563', 'running', s.data.status, s.data.load));
    });
    backendNodes.forEach(b => {
      databaseNodes.forEach(d  => newEdges.push(mkEdge(`b-d-${b.id}-${d.id}`, b.id, d.id, '#f59e0b', b.data.status, d.data.status, b.data.load)));
      cacheNodes.forEach(c    => newEdges.push(mkEdge(`b-c-${b.id}-${c.id}`, b.id, c.id, '#a78bfa', b.data.status, c.data.status, b.data.load)));
      monitoringNodes.forEach(m => newEdges.push(mkEdge(`b-m-${b.id}-${m.id}`, b.id, m.id, '#22c55e', b.data.status, m.data.status, b.data.load)));
    });

    setNodes([gatewayNode, ...containerNodes]);
    setEdges(newEdges);
  }, [containers, filter, activeLayers, pulsingNodes, setNodes, setEdges, realTimeStats]);

  useEffect(() => { buildGraph(); }, [containers, filter, activeLayers, buildGraph]);

  useEffect(() => {
    if (realTimeStats) {
      setNodes(nds => nds.map(node => {
        if (node.type !== 'container') return node;
        const cpu = (realTimeStats.telemetry.cpu / 10).toFixed(2);
        return {
          ...node,
          data: {
            ...node.data,
            cpu: `${cpu}%`,
            mem: `${realTimeStats.telemetry.memory} MB`,
            memPercent: `${realTimeStats.telemetry.memory}`,
            load: realTimeStats.telemetry.cpu
          }
        };
      }));
    }
  }, [realTimeStats, setNodes]);

  const runningCount = containers.filter(c => c.State === 'running').length;
  const healthScore  = Math.round((runningCount / (containers.length || 1)) * 100);

  const layers = [
    { id: 'frontend',   icon: Globe,    color: 'text-accent-cyan',  label: 'FE'   },
    { id: 'backend',    icon: Server,   color: 'text-accent-blue',  label: 'API'  },
    { id: 'database',   icon: Database, color: 'text-amber-400',    label: 'DB'   },
    { id: 'cache',      icon: Cpu,      color: 'text-purple-400',   label: 'Cache'},
    { id: 'monitoring', icon: Activity, color: 'text-accent-green', label: 'OBS'  },
    { id: 'service',    icon: Network,  color: 'text-slate-400',    label: 'SVC'  },
  ];

  return (
    <div className="h-[calc(100vh-160px)] w-full relative bg-[#0a0a0d] rounded-xl border border-white/[0.06] overflow-hidden">

      {/* Subtle background grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* Top controls bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-surface-1/80 backdrop-blur-sm">

        {/* Left: title + status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network size={14} className="text-accent-blue opacity-70" />
            <span className="text-xs font-semibold text-white">Infrastructure Map</span>
          </div>
          <div className="w-px h-3.5 bg-white/[0.08]" />
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-accent-green' : 'bg-slate-600'}`} style={isConnected ? { animation: 'pulse 2.5s ease-in-out infinite' } : {}} />
            <span className="text-2xs font-mono text-slate-500">{isConnected ? 'telemetry active' : 'offline'}</span>
          </div>
          <div className="w-px h-3.5 bg-white/[0.08]" />
          {/* Compact metadata strip */}
          <div className="flex items-center gap-0 divide-x divide-white/[0.05]">
            {[
              { k: 'nodes', v: `${runningCount}/${containers.length}` },
              { k: 'edges', v: edges.length },
              { k: 'health', v: `${healthScore}%` },
            ].map(({ k, v }) => (
              <div key={k} className="px-2.5 flex items-center gap-1.5">
                <span className="text-2xs font-mono text-slate-600 uppercase">{k}</span>
                <span className="text-2xs font-mono text-slate-400 tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: search + navigation controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-1.5 bg-surface-2 border border-white/[0.06] rounded-md px-2.5 py-1.5">
            <Search size={11} className="text-slate-600" />
            <input
              type="text"
              placeholder="Search service..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-2xs text-slate-300 w-32 placeholder:text-slate-600 font-mono"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-0.5 bg-surface-2 border border-white/[0.06] rounded-md p-0.5">
            {['all', 'running', 'stopped'].map(st => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-2.5 py-1 rounded text-2xs font-mono uppercase tracking-wide transition-all duration-100 ${
                  filter === st
                    ? 'bg-accent-blue/15 text-accent-blue'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-surface-2 border border-white/[0.06] rounded-md p-0.5">
            <button onClick={() => zoomOut()} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded">
              <Minus size={12} />
            </button>
            <button onClick={() => fitView({ duration: 500 })} className="p-1.5 text-accent-blue/70 hover:text-accent-blue transition-colors rounded">
              <Maximize size={12} />
            </button>
            <button onClick={() => zoomIn()} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded">
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Left sidebar: layer toggles */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1">
        <div className="bg-surface-1/90 border border-white/[0.06] rounded-lg p-1.5 flex flex-col gap-1 backdrop-blur-sm">
          <span className="text-2xs font-mono text-slate-700 uppercase px-1 pb-0.5">Layers</span>
          {layers.map(layer => {
            const Icon = layer.icon;
            const active = activeLayers.includes(layer.id);
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayers(prev =>
                  prev.includes(layer.id) ? prev.filter(l => l !== layer.id) : [...prev, layer.id]
                )}
                title={layer.id}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-2xs font-mono transition-all duration-100 ${
                  active ? `${layer.color} bg-white/5` : 'text-slate-700 hover:text-slate-500'
                }`}
              >
                <Icon size={11} />
                <span className="uppercase tracking-wide">{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom legend */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-surface-1/80 border border-white/[0.05] rounded-md px-4 py-1.5 flex items-center gap-5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
            <span className="text-2xs font-mono text-slate-600">running</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-2xs font-mono text-slate-600">stopped</span>
          </div>
          <div className="w-px h-3 bg-white/[0.06]" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-px bg-accent-blue/40 relative overflow-hidden rounded-full">
              <div
                className="absolute top-0 left-0 h-full w-3 bg-accent-blue/70"
                style={{ animation: 'topo-flow-legend 1.5s linear infinite' }}
              />
            </div>
            <span className="text-2xs font-mono text-slate-600">traffic flow</span>
          </div>
        </div>
      </div>

      {/* React Flow canvas */}
      <div className="absolute inset-0 pt-[44px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="transparent" />
        </ReactFlow>
      </div>

      <style>{`
        .react-flow__handle {
          width: 6px; height: 6px;
          background: #374151;
          border: 1.5px solid #0a0a0d;
        }
        .react-flow__attribution { display: none; }
        .react-flow__controls { display: none; }

        .topo-flowing-edge {
          animation: topo-flow linear infinite;
        }
        @keyframes topo-flow {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0;  }
        }
        @keyframes topo-flow-legend {
          from { transform: translateX(-100%); }
          to   { transform: translateX(200%);  }
        }

        .topo-event-flash {
          animation: topo-flash 0.6s ease-out;
        }
        @keyframes topo-flash {
          0%   { border-color: rgba(34,197,94,0.5); }
          100% { border-color: rgba(255,255,255,0.07); }
        }
      `}</style>
    </div>
  );
};

const Topology = (props) => (
  <ReactFlowProvider>
    <TopologyContent {...props} />
  </ReactFlowProvider>
);

export default Topology;
