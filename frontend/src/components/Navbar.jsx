import { Search, Bell, Cpu, Server, Clock, LogIn, UserPlus, Ghost, Key, User, Settings, LogOut, Shield } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [time, setTime] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthClick = () => {
    setIsProfileOpen(false);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <nav className="h-20 bg-[#111114]/60 backdrop-blur-md border-b border-white/5 fixed top-0 right-0 left-0 z-40 flex items-center justify-between px-8 pl-[280px]">
        <div className="flex items-center gap-8 flex-1">
          <div className="relative group max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-blue transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search containers, images, logs..."
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue/30 transition-all placeholder:text-slate-600 shadow-inner group-focus-within:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
              <Cpu size={16} className="text-accent-cyan" />
              <span className="text-xs font-mono text-slate-300">12.4%</span>
            </div>
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
              <Server size={16} className="text-accent-blue" />
              <span className="text-xs font-mono text-slate-300">4.2 GB</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-accent-purple" />
              <span className="text-xs font-mono text-slate-300">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent-blue rounded-full ring-4 ring-dark"></span>
            </button>
            
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple p-[1px] transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] ${isProfileOpen ? 'ring-2 ring-accent-blue/50 scale-105' : ''}`}
            >
              <div className="w-full h-full rounded-[11px] bg-dark flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user ? user.username : 'DockerAdmin'}`} 
                  alt="Avatar" 
                  className="w-8 h-8" 
                />
              </div>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-[calc(100%+12px)] right-0 w-72 bg-[#0c0c0e]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-purple opacity-50"></div>
                  
                  <div className="p-5">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                        {isAuthenticated ? <Shield size={24} className="text-emerald-500" /> : <User size={24} className="text-accent-blue" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">{user ? user.username : 'System Admin'}</h4>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                          {user ? user.role : 'Unauthenticated'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {!isAuthenticated ? (
                        <>
                          <button 
                            onClick={handleAuthClick}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-accent-blue text-white font-bold text-sm hover:bg-accent-blue/90 transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] group"
                          >
                            <LogIn size={16} />
                            <span>Log In / Sign Up</span>
                          </button>
                          <button 
                            onClick={() => { logout(); setIsProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 font-bold text-sm hover:bg-white/10 transition-all"
                          >
                            <Ghost size={16} />
                            <span>Stay as Guest</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-300 font-bold text-sm hover:bg-white/10 transition-all">
                            <User size={16} className="text-accent-blue" />
                            <span>Account Details</span>
                          </button>
                          <button 
                            onClick={() => { logout(); setIsProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold text-sm hover:bg-rose-500/20 transition-all"
                          >
                            <LogOut size={16} />
                            <span>Sign Out Node</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 space-y-1">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                        <Settings size={14} />
                        <span>Profile Settings</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
