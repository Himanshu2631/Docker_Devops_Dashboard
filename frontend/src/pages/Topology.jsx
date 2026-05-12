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
  Filter, Play, Square, Globe, Search, Plus, Minus, Maximize, 
  Zap, Shield, Layers, BarChart3, Info, AlertCircle, Link2
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

// --- Tooltip Component ---
const NodeTooltip = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 pointer-events-none"
  >
    <div className="bg-[#1a1a20]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[200px]">
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
        <div className={`p-2 rounded-lg ${data.status === 'running' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          <Info size={16} />
        </div>
        <div>
          <div className="text-xs font-black text-white uppercase tracking-tight">{data.label}</div>
          <div className="text-[8px] text-slate-500 font-mono">{data.shortId}</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[9px]">
          <span className="text-slate-500 uppercase tracking-widest font-bold">Image</span>
          <span className="text-white/80 font-mono truncate max-w-[120px] font-medium">{data.image}</span>
        </div>
        <div className="flex justify-between items-center text-[9px]">
          <span className="text-slate-500 uppercase tracking-widest font-bold">Ports</span>
          <span className="text-white/80 font-mono">{data.ports}</span>
        </div>
        <div className="flex justify-between items-center text-[9px]">
          <span className="text-slate-500 uppercase tracking-widest font-bold">Uptime</span>
          <span className="text-white/80 font-mono">{data.uptime}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Custom Gateway Node ---
const GatewayNode = ({ data }) => (
  <div className="relative group">
    <div className="w-24 h-24 rounded-full bg-accent-blue/10 border-2 border-accent-blue/40 flex flex-col items-center justify-center gap-2 backdrop-blur-xl shadow-[0_0_30px_rgba(59,130,246,0.2)] group-hover:border-accent-blue transition-all duration-500">
      <div className="p-2 bg-accent-blue/20 rounded-lg text-accent-blue animate-pulse">
        <Globe size={24} />
      </div>
      <span className="text-[9px] font-black text-white uppercase tracking-tighter">Gateway</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-accent-blue !border-none !w-2 !h-2" />
  </div>
);

// --- Custom Edge Component for Glowing Effect ---
const GlowingEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  
  const isRunning = data?.status === 'running';
  const load = parseFloat(data?.load || '0');
  const edgeColor = isRunning ? (style.stroke || '#3b82f6') : '#f43f5e';
  
  // Faster animation for higher load
  const flowDuration = load > 5 ? '1s' : load > 2 ? '2s' : '4s';

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
          ...style, 
          strokeWidth: 6, 
          stroke: edgeColor, 
          opacity: 0.05, 
          filter: 'blur(8px)' 
        }} 
      />
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
          ...style, 
          strokeWidth: 2, 
          stroke: edgeColor, 
          opacity: 0.15,
          animation: isRunning ? 'edgePulse 3s infinite alternate' : 'none'
        }} 
      />
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
          ...style, 
          strokeWidth: 1, 
          stroke: edgeColor,
          opacity: isRunning ? 0.8 : 0.3
        }} 
      />
      {isRunning && (
        <path
          d={edgePath}
          fill="none"
          stroke={edgeColor}
          strokeWidth={2}
          strokeDasharray="4, 16"
          className="flowing-edge"
          style={{ animationDuration: flowDuration }}
        />
      )}
    </>
  );
};

// --- Custom Node Component ---
const ContainerNode = ({ data }) => {
  const isRunning = data.status === 'running';
  const [showTooltip, setShowTooltip] = useState(false);
  
  // CPU-based pulse speed
  const cpuLoad = parseFloat(data.cpu || '0');
  const pulseDuration = cpuLoad > 5 ? '0.8s' : cpuLoad > 2 ? '1.5s' : '3s';

  const getTypeIcon = () => {
    if (data.type === 'database') return <Database size={20} />;
    if (data.type === 'frontend') return <Globe size={20} />;
    if (data.type === 'monitoring') return <Activity size={20} />;
    if (data.type === 'cache') return <Cpu size={20} />;
    return <Server size={20} />;
  };

  const getTypeColor = () => {
    if (data.type === 'database') return 'text-orange-500 bg-orange-500/10 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]';
    if (data.type === 'frontend') return 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]';
    if (data.type === 'monitoring') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.1)]';
    if (data.type === 'cache') return 'text-purple-400 bg-purple-400/10 border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]';
    return 'text-accent-blue bg-accent-blue/10 border-accent-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <AnimatePresence>
        {showTooltip && <NodeTooltip data={data} />}
      </AnimatePresence>

      <Handle type="target" position={Position.Top} className="!bg-accent-blue !border-none !w-1.5 !h-1.5" />
      
      <motion.div
        layout
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`bg-[#111114]/90 backdrop-blur-3xl border transition-all duration-500 rounded-2xl p-4 min-w-[240px] 
          ${isRunning ? 'border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.08)]' : 'border-rose-500/20 opacity-60 grayscale-[0.5]'}
          ${data.isPulsing ? 'animate-eventPulse' : ''}`}
        style={{ 
          animation: isRunning ? `ambientNodePulse ${pulseDuration} ease-in-out infinite` : 'none'
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-xl ${getTypeColor()} relative transition-transform duration-300 group-hover:scale-110`}>
            {getTypeIcon()}
            {isRunning && <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75" />}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-sm font-black text-white truncate uppercase tracking-tight">{data.label}</div>
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter flex items-center gap-2 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-rose-500'}`} />
              {data.status} • {data.type}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[8px] text-slate-500 uppercase font-black tracking-widest">
              <Cpu size={10} className="text-accent-cyan" /> Load
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-accent-cyan" animate={{ width: data.cpu || '0%' }} />
            </div>
            <div className="text-[10px] font-mono text-white/80">{data.cpu || '0.0%'}</div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[8px] text-slate-500 uppercase font-black tracking-widest">
              <HardDrive size={10} className="text-accent-purple" /> Heap
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-accent-purple" animate={{ width: data.memPercent || '40%' }} />
            </div>
            <div className="text-[10px] font-mono text-white/80">{data.mem || '0MB'}</div>
          </div>
        </div>
      </motion.div>
      <Handle type="source" position={Position.Bottom} className="!bg-accent-blue !border-none !w-1.5 !h-1.5" />
    </div>
  );
};

// --- Main Topology Component ---
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
  const containerNodesRef = useRef([]);

  const nodeTypes = useMemo(() => ({ 
    container: ContainerNode,
    gateway: GatewayNode
  }), []);
  const edgeTypes = useMemo(() => ({ glowing: GlowingEdge }), []);

  // Handle Event Pulsing
  useEffect(() => {
    if (lastEvent?.type === 'container') {
      const containerId = lastEvent.actorId;
      setPulsingNodes(prev => new Set([...prev, containerId]));
      setTimeout(() => {
        setPulsingNodes(prev => {
          const next = new Set(prev);
          next.delete(containerId);
          return next;
        });
      }, 3000);
    }
  }, [lastEvent]);

  // Handle Search focusing
  useEffect(() => {
    if (searchQuery && nodes.length > 0) {
      const match = nodes.find(n => 
        n.data?.label?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.data?.image?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match) {
        setCenter(match.position.x + 120, match.position.y + 60, { zoom: 1.2, duration: 800 });
      }
    }
  }, [searchQuery, nodes, setCenter]);

  const getContainerType = (name, image) => {
    const searchStr = (name + image).toLowerCase();
    if (searchStr.includes('db') || searchStr.includes('mongo') || searchStr.includes('sql') || searchStr.includes('postgres')) return 'database';
    if (searchStr.includes('redis') || searchStr.includes('memcached') || searchStr.includes('cache')) return 'cache';
    if (searchStr.includes('front') || searchStr.includes('web') || searchStr.includes('app') || searchStr.includes('ui') || searchStr.includes('react') || searchStr.includes('next')) return 'frontend';
    if (searchStr.includes('api') || searchStr.includes('back') || searchStr.includes('server') || searchStr.includes('node') || searchStr.includes('express')) return 'backend';
    if (searchStr.includes('prom') || searchStr.includes('grafana') || searchStr.includes('log') || searchStr.includes('monitor') || searchStr.includes('health')) return 'monitoring';
    return 'service';
  };

  const buildGraph = useCallback(() => {
    if (!containers) return;

    let filteredContainers = containers;
    if (filter === 'running') filteredContainers = containers.filter(c => c.State === 'running');
    if (filter === 'stopped') filteredContainers = containers.filter(c => c.State !== 'running');
    
    filteredContainers = filteredContainers.filter(c => activeLayers.includes(getContainerType(c.Names[0], c.Image)));

    const gatewayNode = {
      id: 'gateway',
      type: 'gateway',
      data: { label: 'External Gateway' },
      position: { x: 500, y: -100 }
    };

    const containerNodes = filteredContainers.map((c) => {
      const type = getContainerType(c.Names[0], c.Image);
      const hasPublicPorts = c.Ports && c.Ports.some(p => p.PublicPort);
      
      // Dynamic spacing based on container count
      const spacing = containers.length > 10 ? 250 : 350;
      
      // Layer-based positioning
      if (!positionsRef.current[c.Id]) {
        let x = 0;
        let y = 0;
        
        const layers = {
          gateway: -100,
          frontend: 150,
          backend: 450,
          database: 750,
          cache: 750,
          monitoring: 450,
          service: 450
        };

        y = layers[type] || 450;
        
        const nodesInLayer = filteredContainers.filter(nc => getContainerType(nc.Names[0], nc.Image) === type);
        const nodeIndex = nodesInLayer.findIndex(nc => nc.Id === c.Id);
        const totalInLayer = nodesInLayer.length;
        
        const offset = (totalInLayer - 1) * spacing / 2;
        x = 500 + (nodeIndex * spacing) - offset;

        if (type === 'monitoring') x += 600;
        if (type === 'cache') x -= 400;

        positionsRef.current[c.Id] = { x, y };
      }

      return {
        id: c.Id,
        type: 'container',
        data: { 
          label: c.Names[0]?.replace('/', '') || 'unknown',
          status: c.State,
          type: type,
          shortId: c.Id.substring(0, 8),
          cpu: '0%', 
          mem: '0 MB',
          image: c.Image,
          uptime: c.Status,
          hasPublicPorts,
          isPulsing: pulsingNodes.has(c.Id),
          load: realTimeStats?.telemetry.cpu || 0,
          ports: c.Ports?.[0] ? `${c.Ports[0].PublicPort || ''}:${c.Ports[0].PrivatePort}` : 'Internal'
        },
        position: positionsRef.current[c.Id]
      };
    });

    containerNodesRef.current = containerNodes;

    const newEdges = [];
    const frontendNodes = containerNodes.filter(n => n.data.type === 'frontend' || n.data.hasPublicPorts);
    const backendNodes = containerNodes.filter(n => n.data.type === 'backend');
    const databaseNodes = containerNodes.filter(n => n.data.type === 'database');
    const cacheNodes = containerNodes.filter(n => n.data.type === 'cache');
    const monitoringNodes = containerNodes.filter(n => n.data.type === 'monitoring');
    const otherNodes = containerNodes.filter(n => !['frontend', 'backend', 'database', 'cache', 'monitoring'].includes(n.data.type));

    // Relationships
    frontendNodes.forEach(f => {
      newEdges.push({ 
        id: `g-f-${f.id}`, 
        source: 'gateway', 
        target: f.id, 
        type: 'glowing', 
        data: { status: f.data.status, load: f.data.load },
        style: { stroke: f.data.type === 'frontend' ? '#06b6d4' : '#3b82f6' } 
      });

      if (f.data.type === 'frontend') {
        backendNodes.forEach(b => {
          newEdges.push({ 
            id: `f-b-${f.id}-${b.id}`, 
            source: f.id, 
            target: b.id, 
            type: 'glowing', 
            data: { 
              status: f.data.status === 'running' && b.data.status === 'running' ? 'running' : 'stopped',
              load: (parseFloat(f.data.load) + parseFloat(b.data.load)) / 2
            },
            style: { stroke: '#3b82f6' } 
          });
        });
      }
    });

    otherNodes.forEach(s => {
      if (!frontendNodes.find(f => f.id === s.id)) {
        newEdges.push({
          id: `g-s-${s.id}`,
          source: 'gateway',
          target: s.id,
          type: 'glowing',
          data: { status: s.data.status, load: s.data.load },
          style: { stroke: '#94a3b8' }
        });
      }
    });

    backendNodes.forEach(b => {
      databaseNodes.forEach(d => {
        newEdges.push({ 
          id: `b-d-${b.id}-${d.id}`, 
          source: b.id, 
          target: d.id, 
          type: 'glowing', 
          data: { 
            status: b.data.status === 'running' && d.data.status === 'running' ? 'running' : 'stopped',
            load: (parseFloat(b.data.load) + parseFloat(d.data.load)) / 2
          },
          style: { stroke: '#f59e0b' } 
        });
      });
      cacheNodes.forEach(c => {
        newEdges.push({ 
          id: `b-c-${b.id}-${c.id}`, 
          source: b.id, 
          target: c.id, 
          type: 'glowing', 
          data: { 
            status: b.data.status === 'running' && c.data.status === 'running' ? 'running' : 'stopped',
            load: (parseFloat(b.data.load) + parseFloat(c.data.load)) / 2
          },
          style: { stroke: '#a855f7' } 
        });
      });
      monitoringNodes.forEach(m => {
        newEdges.push({ 
          id: `b-m-${b.id}-${m.id}`, 
          source: b.id, 
          target: m.id, 
          type: 'glowing', 
          data: { 
            status: b.data.status === 'running' && m.data.status === 'running' ? 'running' : 'stopped',
            load: (parseFloat(b.data.load) + parseFloat(m.data.load)) / 2
          },
          style: { stroke: '#10b981' } 
        });
      });
    });

    setNodes([gatewayNode, ...containerNodes]);
    setEdges(newEdges);
  }, [containers, filter, activeLayers, pulsingNodes, setNodes, setEdges, realTimeStats]);

  useEffect(() => {
    buildGraph();
  }, [containers, filter, activeLayers, buildGraph]);

  useEffect(() => {
    if (realTimeStats) {
      setNodes((nds) => nds.map((node) => {
        if (node.type === 'container') {
          return {
            ...node,
            data: {
              ...node.data,
              cpu: `${(realTimeStats.telemetry.cpu / 10).toFixed(2)}%`,
              mem: `${realTimeStats.telemetry.memory} MB`,
              memPercent: `${realTimeStats.telemetry.memory}%`,
              load: realTimeStats.telemetry.cpu
            }
          };
        }
        return node;
      }));
    }
  }, [realTimeStats, setNodes]);

  const runningCount = containers.filter(c => c.State === 'running').length;
  const healthScore = Math.round((runningCount / (containers.length || 1)) * 100);

  return (
    <div className="h-[calc(100vh-160px)] w-full relative bg-[#0c0c0e] rounded-[40px] border border-white/5 overflow-hidden group/topology shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ backgroundPosition: ['0px 0px', '100px 100px'] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:50px_50px] opacity-20"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:150px_150px]" />
        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_4px,3px_100%]" />
      </div>

      {/* Infrastructure Widgets */}
      <div className="absolute top-8 left-8 right-8 z-20 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-6 pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-accent-blue/10 rounded-2xl text-accent-blue border border-accent-blue/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <Network size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                Orchestration <span className="text-accent-blue opacity-50 font-light">Map</span>
                <span className="text-[10px] bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded-full not-italic tracking-normal">Enterprise v2</span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-rose-500'}`}></span>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.3em]">
                  {isConnected ? 'Telemetry stream active' : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-black/60 backdrop-blur-3xl border border-white/10 p-4 rounded-3xl flex items-center gap-4 shadow-2xl min-w-[160px]">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><Zap size={18} /></div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Health</div>
                <div className="text-xl font-black text-white mt-1">{healthScore}%</div>
              </div>
            </div>
            <div className="bg-black/60 backdrop-blur-3xl border border-white/10 p-4 rounded-3xl flex items-center gap-4 shadow-2xl min-w-[160px]">
              <div className="p-2 bg-accent-blue/10 rounded-xl text-accent-blue"><Layers size={18} /></div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active</div>
                <div className="text-xl font-black text-white mt-1">{runningCount}</div>
              </div>
            </div>
            <div className="bg-black/60 backdrop-blur-3xl border border-white/10 p-4 rounded-3xl flex items-center gap-4 shadow-2xl min-w-[160px]">
              <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500"><Link2 size={18} /></div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Dependencies</div>
                <div className="text-xl font-black text-white mt-1">{edges.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Control Panel */}
        <div className="flex flex-col gap-4 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-3xl border border-white/10 p-2 rounded-2xl flex items-center gap-2 shadow-2xl w-80">
            <Search size={16} className="ml-3 text-slate-500" />
            <input 
              type="text" 
              placeholder="Focus on service..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[11px] text-white w-full py-2 placeholder:text-slate-600 font-medium"
            />
          </div>
          
          <div className="bg-black/60 backdrop-blur-3xl border border-white/10 p-3 rounded-3xl flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between px-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Navigation</span>
              <div className="flex gap-2">
                <button onClick={() => zoomIn()} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><Plus size={14} /></button>
                <button onClick={() => zoomOut()} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><Minus size={14} /></button>
                <button onClick={() => fitView({ duration: 800 })} className="p-1.5 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-lg text-accent-blue transition-colors"><Maximize size={14} /></button>
              </div>
            </div>
            
            <div className="w-full h-px bg-white/5" />
            
            <div className="flex items-center justify-between px-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Layers</span>
              <span className="text-[8px] text-accent-blue font-mono">{activeLayers.length} Active</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'frontend', icon: Globe, color: 'text-accent-cyan' },
                { id: 'backend', icon: Server, color: 'text-accent-blue' },
                { id: 'database', icon: Database, color: 'text-orange-500' },
                { id: 'cache', icon: Cpu, color: 'text-purple-400' },
                { id: 'monitoring', icon: Activity, color: 'text-emerald-400' },
                { id: 'service', icon: Network, color: 'text-slate-400' }
              ].map(layer => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayers(prev => prev.includes(layer.id) ? prev.filter(l => l !== layer.id) : [...prev, layer.id])}
                  className={`p-2 rounded-xl border transition-all duration-300 ${activeLayers.includes(layer.id) ? 'bg-white/10 border-white/20 ' + layer.color : 'bg-black/40 border-white/5 text-slate-600 grayscale'}`}
                >
                  <layer.icon size={14} />
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 mt-1">
              {['all', 'running', 'stopped'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`flex-1 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${filter === st ? 'bg-accent-blue border-accent-blue text-white shadow-lg shadow-accent-blue/20' : 'bg-black/40 border-white/5 text-slate-500'}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="absolute bottom-8 left-8 z-20 flex gap-4 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-full flex items-center gap-8 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exited</span></div>
          <div className="w-px h-4 bg-white/10"></div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-0.5 bg-accent-blue/30 relative overflow-hidden rounded-full">
              <motion.div animate={{ x: [-20, 40] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="absolute top-0 left-0 w-4 h-full bg-accent-blue" />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data Stream</span>
          </div>
        </div>
      </div>

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

      <style jsx global>{`
        .react-flow__handle { width: 8px; height: 8px; background: #3b82f6; border: 2px solid #0c0c0e; box-shadow: 0 0 10px rgba(59,130,246,0.5); }
        .react-flow__attribution { display: none; }
        
        @keyframes edgePulse {
          from { opacity: 0.1; stroke-width: 2; }
          to { opacity: 0.3; stroke-width: 4; }
        }

        .flowing-edge {
          animation: flow linear infinite;
        }

        @keyframes flow {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }

        @keyframes ambientNodePulse {
          0% { box-shadow: 0 0 15px rgba(59,130,246,0.1); }
          50% { box-shadow: 0 0 25px rgba(59,130,246,0.3); }
          100% { box-shadow: 0 0 15px rgba(59,130,246,0.1); }
        }

        @keyframes eventPulse {
          0% { transform: scale(1); filter: brightness(1); }
          20% { transform: scale(1.15); filter: brightness(2); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        .animate-eventPulse {
          animation: eventPulse 1s cubic-bezier(0,0,0.2,1) infinite;
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
