import { Search, Bell, Cpu, Server, Clock, LogIn, Ghost, User, Settings, LogOut, Shield } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [time, setTime] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();
  const { isConnected } = useSocket();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="h-14 bg-surface-1/80 backdrop-blur-md border-b border-white/[0.06] fixed top-0 right-0 left-0 z-40 flex items-center justify-between px-6 pl-[236px]">
        {/* Search */}
        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-slate-400 transition-colors" size={14} />
          <input
            type="text"
            placeholder="Search containers, images, logs..."
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg py-2 pl-9 pr-4 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-accent-blue/30 focus:bg-white/[0.06] transition-all"
          />
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-4">
          {/* Telemetry strip */}
          <div className="hidden lg:flex items-center gap-0 border border-white/[0.06] rounded-lg bg-surface-2 divide-x divide-white/[0.06]">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-accent-green' : 'bg-slate-600'} ${isConnected ? 'animate-pulse' : ''}`} />
              <span className={`font-mono text-2xs font-medium ${isConnected ? 'text-accent-green' : 'text-slate-600'}`}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5">
              <Cpu size={12} className="text-slate-500" />
              <span className="font-mono text-2xs text-slate-300">12.4%</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5">
              <Server size={12} className="text-slate-500" />
              <span className="font-mono text-2xs text-slate-300">4.2 GB</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5">
              <Clock size={12} className="text-slate-500" />
              <span className="font-mono text-2xs text-slate-300">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Notification */}
          <button className="p-1.5 hover:bg-white/5 rounded-md text-slate-500 hover:text-slate-300 transition-colors relative">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent-blue rounded-full" />
          </button>

          {/* Avatar dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`w-8 h-8 rounded-md border transition-all ${isProfileOpen ? 'border-accent-blue/40 bg-accent-blue/10' : 'border-white/[0.08] bg-surface-2 hover:border-white/20'}`}
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'DockerAdmin'}`}
                alt="Avatar"
                className="w-full h-full rounded-[5px] object-cover"
              />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-[calc(100%+8px)] right-0 w-64 bg-surface-2 border border-white/[0.08] rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-3 border border-white/[0.08] flex items-center justify-center">
                        {isAuthenticated ? <Shield size={16} className="text-accent-green" /> : <User size={16} className="text-slate-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{user?.username || 'System Admin'}</p>
                        <p className="font-mono text-2xs text-slate-500 uppercase">{user?.role || 'Unauthenticated'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 space-y-0.5">
                    {!isAuthenticated ? (
                      <>
                        <button
                          onClick={() => { setIsProfileOpen(false); setIsAuthModalOpen(true); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md bg-accent-blue text-white text-sm font-medium hover:bg-blue-500 transition-colors"
                        >
                          <LogIn size={14} />
                          <span>Log In / Sign Up</span>
                        </button>
                        <button
                          onClick={() => { logout(); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-400 text-sm hover:bg-white/[0.04] hover:text-slate-300 transition-colors"
                        >
                          <Ghost size={14} />
                          <span>Continue as Guest</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-400 text-sm hover:bg-white/[0.04] hover:text-slate-300 transition-colors">
                          <User size={14} />
                          <span>Account Details</span>
                        </button>
                        <button
                          onClick={() => { logout(); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-accent-red text-sm hover:bg-accent-red/5 transition-colors"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </>
                    )}
                    <div className="border-t border-white/[0.06] mt-1 pt-1">
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-500 text-xs hover:bg-white/[0.04] hover:text-slate-400 transition-colors">
                        <Settings size={13} />
                        <span>Preferences</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
