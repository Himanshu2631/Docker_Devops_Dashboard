import { LayoutDashboard, Database, Activity, Settings, Shield, ChevronLeft, ChevronRight, HardDrive, Network, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const Sidebar = ({ activeView, onViewChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', active: activeView === 'dashboard' },
    { id: 'containers', icon: Database, label: 'Containers', active: activeView === 'containers' },
    { id: 'topology', icon: Network, label: 'Infrastructure Map', active: activeView === 'topology' },
    { id: 'analytics', icon: Activity, label: 'Analytics', active: activeView === 'analytics' },
    { id: 'ai', icon: Sparkles, label: 'AI Copilot', active: activeView === 'ai' },
    { id: 'images', icon: HardDrive, label: 'Images', active: false },
    { id: 'security', icon: Shield, label: 'Security', active: false },
    { id: 'settings', icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      className="bg-[#111114]/60 backdrop-blur-md border-r border-white/5 h-screen fixed left-0 top-0 z-50 flex flex-col transition-all duration-300"
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Activity className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Docker<span className="text-accent-blue">OS</span></span>
          </motion.div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => item.id && onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5",
              item.active && "bg-blue-500/10 border border-blue-500/20 text-accent-blue",
              isCollapsed && "justify-center px-0"
            )}
          >
            <item.icon size={22} className={cn(item.active ? "text-accent-blue" : "text-slate-400")} />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-medium"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className={cn(
          "bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border border-white/5 rounded-2xl p-4",
          isCollapsed && "p-2"
        )}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Health</span>
                <span className="text-xs text-accent-cyan font-mono">98%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accent-cyan w-[98%] shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              </div>
            </>
          ) : (
            <div className="w-2 h-2 rounded-full bg-accent-cyan mx-auto shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
