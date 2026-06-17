import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { formatDateTime } from '../../utils/waterTreatment';

export function AlertToast() {
  const alertRecords = useSimulationStore((state) => state.alertRecords);
  const [visibleAlerts, setVisibleAlerts] = useState<typeof alertRecords>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    const recentAlerts = alertRecords.slice(-3).filter((_, i, arr) => {
      const timestamp = arr[i].timestamp;
      return !dismissed.has(timestamp);
    });
    setVisibleAlerts(recentAlerts);
  }, [alertRecords, dismissed]);

  const handleDismiss = (timestamp: number) => {
    setDismissed(prev => new Set(prev).add(timestamp));
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2">
      {visibleAlerts.map((alert, index) => (
        <div
          key={`${alert.timestamp}-${index}`}
          className="flex items-start gap-3 bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-xl p-4 shadow-lg animate-in slide-in-from-right duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-400">{alert.unitName}</span>
              <span className="text-red-300 text-sm">超标警报</span>
            </div>
            <p className="text-sm text-red-200 mt-1">
              {alert.parameterName}: {alert.value.toFixed(1)} (限值: {alert.limit.toFixed(1)})
            </p>
            <p className="text-xs text-red-300/60 mt-1">
              {formatDateTime(alert.timestamp)}
            </p>
          </div>
          <button
            onClick={() => handleDismiss(alert.timestamp)}
            className="text-red-400/60 hover:text-red-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
