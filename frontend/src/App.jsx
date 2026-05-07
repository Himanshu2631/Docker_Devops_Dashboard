import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Services
import socketService from './services/socket';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Modal from './components/Modal';
import TerminalConsole from './components/TerminalConsole';

// Views
import DashboardView from './pages/DashboardView';
import ContainersView from './pages/ContainersView';

function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const [containers, setContainers] = useState([]);
  const [stats, setStats] = useState({ total: 0, running: 0, exited: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [monitoringData, setMonitoringData] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState('');
  const [activeContainerName, setActiveContainerName] = useState('System');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { api } = useAuth();

  const fetchContainers = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsUpdating(true);
    try {
      const response = await api.get('containers');
      if (response.data && response.data.success) {
        setContainers(response.data.data || []);
        setStats({
          total: response.data.total || 0,
          running: response.data.running || 0,
          exited: response.data.exited || 0
        });
        setError(null);
      }
    } catch (err) {
      setError(`Connection Error: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setIsUpdating(false), 800);
    }
  }, [api]);

  const addEvent = (containerName, type) => {
    const newEvent = {
      id: Date.now(),
      containerName,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 10));
  };

  useEffect(() => {
    fetchContainers();
    
    const interval = setInterval(() => {
      if (!socketService.isConnected()) {
        fetchContainers(true);
      }
    }, 60000); 
    
    socketService.connect();
    socketService.on('server:connected', () => setIsLive(true));
    
    socketService.on('docker:event', (event) => {
      setIsUpdating(true);
      fetchContainers(true);
      addEvent(event.containerName, event.actionType);
      
      const newNotification = {
        id: Date.now(),
        title: `Container ${event.actionType.toUpperCase()}`,
        message: `${event.containerName} is now ${event.actionType}`,
        type: event.actionType === 'stop' ? 'error' : 'success'
      };
      setNotifications(prev => [newNotification, ...prev]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    });

    return () => {
      clearInterval(interval);
      socketService.disconnect();
    };
  }, [fetchContainers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMonitoringData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString(),
          cpu: Math.floor(Math.random() * 30) + 10,
          memory: Math.floor(Math.random() * 20) + 50,
          containers: stats.running,
          network: Math.floor(Math.random() * 100)
        }];
        return newData.slice(-20);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [stats.running]);

  const handleAction = async (id, action) => {
    try {
      await api.post(`containers/${id}/${action}`);
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-slate-300 overflow-x-hidden">
      <div className="ambient-glow" />
      <div className="grid-overlay" />
      
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <Navbar />

      <main className="pl-[280px] pt-28 pr-8 pb-32 min-h-screen">
        <div className="max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' ? (
              <DashboardView 
                key="dashboard"
                containers={containers}
                stats={stats}
                monitoringData={monitoringData}
                events={events}
                isUpdating={isUpdating}
                isLive={isLive}
              />
            ) : (
              <ContainersView 
                key="containers"
                containers={containers}
                loading={loading}
                error={error}
                isUpdating={isUpdating}
                onAction={handleAction}
                onLogs={(id, name) => { setActiveContainerName(name); setIsTerminalOpen(true); }}
                onStats={() => setIsModalOpen(true)}
                onRefresh={() => fetchContainers()}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isTerminalOpen && (
          <TerminalConsole logs={terminalLogs} isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} containerName={activeContainerName} />
        )}
      </AnimatePresence>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Resource Metrics">
        <div className="p-8 text-center text-slate-500">Analytics module initializing...</div>
      </Modal>

      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 max-w-md w-full">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div 
              key={n.id} 
              initial={{ opacity: 0, x: 50, scale: 0.9 }} 
              animate={{ opacity: 1, x: 0, scale: 1 }} 
              exit={{ opacity: 0, x: 20, scale: 0.9 }} 
              className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-4 ${n.type === 'error' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}
            >
              <div className={`w-1.5 h-10 rounded-full ${n.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">{n.title}</h4>
                <p className="text-xs text-slate-400">{n.message}</p>
              </div>
              <button onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))} className="ml-auto text-slate-500 hover:text-white">×</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
