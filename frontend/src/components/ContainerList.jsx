import { AnimatePresence } from 'framer-motion';
import ContainerCard from './ContainerCard';

const ContainerList = ({ containers, onAction, onLogs, onStats }) => {
  const safe = Array.isArray(containers) ? containers.filter(c => c?.Id) : [];

  if (safe.length === 0) {
    return (
      <div className="card p-12 flex flex-col items-center justify-center text-center">
        <div className="font-mono text-2xs text-slate-700 mb-3 select-none">
          <span className="text-slate-600">$</span> docker ps --all
        </div>
        <p className="text-slate-500 text-sm mb-1">No containers found</p>
        <p className="text-slate-700 text-xs">Start a Docker container to see it appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {safe.map(container => (
          <ContainerCard
            key={container.Id}
            container={container}
            onAction={onAction}
            onLogs={onLogs}
            onStats={onStats}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ContainerList;
