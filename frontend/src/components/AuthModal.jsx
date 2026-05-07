import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Key, Ghost, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, continueAsGuest } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await signup(formData);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0c0c0e]/90 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Top Glow Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-purple"></div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
            >
              <X size={20} />
            </button>

            <div className="p-10">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-accent-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent-blue/20">
                  {isLogin ? <LogIn className="text-accent-blue" size={32} /> : <UserPlus className="text-accent-purple" size={32} />}
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Join the Network'}
                </h2>
                <p className="text-slate-500 text-sm mt-2">
                  {isLogin ? 'Access your cloud orchestration node' : 'Create your decentralized admin profile'}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm"
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-blue transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Username"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue/30 transition-all placeholder:text-slate-600"
                    />
                  </div>
                )}
                
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-blue transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue/30 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-blue transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="Security Password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue/30 transition-all placeholder:text-slate-600"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-accent-blue text-white font-bold rounded-2xl shadow-[0_8px_25px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Establishing Link...' : (isLogin ? 'Initiate Login' : 'Register Profile')}
                </button>
              </form>

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Alternative Access</span>
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={handleGuest} className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all group">
                    <Ghost size={16} className="group-hover:animate-bounce" />
                    <span>Guest Mode</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <Key size={16} />
                    <span>GitHub</span>
                  </button>
                </div>
              </div>

              <div className="mt-10 text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-xs text-slate-500 hover:text-accent-blue transition-colors"
                >
                  {isLogin ? "Don't have an account? Register Node" : "Already registered? Return to Login"}
                </button>
              </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-accent-blue/5 to-transparent pointer-events-none"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
