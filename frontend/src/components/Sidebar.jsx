import { LayoutDashboard, Database, Activity, Settings, Shield, ChevronLeft, ChevronRight, HardDrive, Network } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const Sidebar = ({ activeView, onViewChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'containers', icon: Database, label: 'Containers' },
    { id: 'topology', icon: Network, label: 'Infra Map' },
    { id: 'analytics', icon: Activity, label: 'Analytics' },

    { id: 'images', icon: HardDrive, label: 'Images' },
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '56px' : '220px' }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="bg-surface-1 border-r border-white/[0.06] h-screen fixed left-0 top-0 z-50 flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-6 h-6 bg-accent-blue rounded-md flex items-center justify-center">
              <Activity className="text-white w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">
              Docker<span className="text-accent-blue">OS</span>
            </span>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1.5 hover:bg-white/5 rounded-md text-slate-500 hover:text-slate-300 transition-colors",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pt-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all duration-150",
                isActive
                  ? "bg-accent-blue/10 text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon
                size={16}
                className={cn(
                  "shrink-0",
                  isActive ? "text-accent-blue" : "text-slate-500"
                )}
              />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.04 }}
                  className="font-medium truncate"
                >
                  {item.label}
                </motion.span>
              )}
              {/* Active indicator — left border style */}
              {isActive && !isCollapsed && (
                <span className="ml-auto w-1 h-4 rounded-full bg-accent-blue opacity-70" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer health indicator */}
      <div className="p-3 border-t border-white/[0.06] shrink-0">
        {!isCollapsed ? (
          <div className="px-2.5 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-2xs font-semibold text-slate-500 uppercase tracking-widest">System Health</span>
              <span className="font-mono text-2xs text-accent-green">98%</span>
            </div>
            <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent-green w-[98%] opacity-70" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
