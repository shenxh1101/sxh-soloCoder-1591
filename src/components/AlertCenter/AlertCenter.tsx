import { useMemo } from 'react';
import { AlertTriangle, Filter, MapPin, X, Search } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { UNIT_NAMES, PARAMETER_INFO, TREATMENT_UNIT_ORDER } from '../../utils/constants';
import { AlertRecord, TreatmentUnitType } from '../../types';

export function AlertCenter() {
  const alertRecords = useSimulationStore((state) => state.alertRecords);
  const alertFilter = useSimulationStore((state) => state.alertFilter);
  const highlightedUnit = useSimulationStore((state) => state.highlightedUnit);
  const setAlertFilter = useSimulationStore((state) => state.setAlertFilter);
  const setShowAlertCenter = useSimulationStore((state) => state.setShowAlertCenter);
  const locateAlert = useSimulationStore((state) => state.locateAlert);

  const unitNameToId = useMemo(() => {
    const map: Record<string, TreatmentUnitType> = {};
    TREATMENT_UNIT_ORDER.forEach((id) => {
      map[UNIT_NAMES[id]] = id;
    });
    return map;
  }, []);

  const parameterNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    PARAMETER_INFO.forEach((p) => {
      map[p.key] = p.name;
    });
    return map;
  }, []);

  const filteredAlerts = useMemo(() => {
    return [...alertRecords]
      .filter((alert) => {
        if (alertFilter.unitId !== 'all') {
          const alertUnitId = unitNameToId[alert.unit];
          if (alertUnitId !== alertFilter.unitId) return false;
        }
        if (alertFilter.parameter !== 'all') {
          if (alert.parameter !== alertFilter.parameter) return false;
        }
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [alertRecords, alertFilter, unitNameToId]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getParameterInfo = (key: string) => {
    return PARAMETER_INFO.find((p) => p.key === key) || PARAMETER_INFO[0];
  };

  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-20 z-40 w-full max-w-3xl max-h-[70vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-red-500/30 shadow-2xl">
      <div className="sticky top-0 z-10 px-6 py-4 border-b border-red-500/20 bg-gradient-to-r from-red-500/10 via-slate-900/95 to-slate-900/95 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                报警中心
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">报警记录</span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs font-bold">
                  {filteredAlerts.length}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAlertCenter(false)}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Filter size={14} className="text-slate-500" />
            <select
              value={alertFilter.unitId}
              onChange={(e) => setAlertFilter({ unitId: e.target.value as TreatmentUnitType | 'all' })}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
            >
              <option value="all">全部构筑物</option>
              {TREATMENT_UNIT_ORDER.map((id) => (
                <option key={id} value={id}>
                  {UNIT_NAMES[id]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Search size={14} className="text-slate-500" />
            <select
              value={alertFilter.parameter}
              onChange={(e) => setAlertFilter({ parameter: e.target.value as any })}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
            >
              <option value="all">全部指标</option>
              {PARAMETER_INFO.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {filteredAlerts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">暂无报警记录</p>
            <p className="text-slate-600 text-sm mt-1">系统运行正常，保持关注</p>
          </div>
        ) : (
          filteredAlerts.map((alert: AlertRecord, index: number) => {
            const paramInfo = getParameterInfo(alert.parameter);
            const alertUnitId = unitNameToId[alert.unit];
            const isHighlighted = highlightedUnit === alertUnitId;

            return (
              <div
                key={`${alert.timestamp}-${index}`}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  isHighlighted
                    ? 'bg-gradient-to-r from-red-500/30 via-red-500/20 to-transparent border-red-500/60 shadow-lg shadow-red-500/20'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-red-500/40 hover:bg-slate-800/70'
                }`}
              >
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className="w-2.5 h-2.5 rounded-full animate-pulse"
                          style={{ backgroundColor: paramInfo.color }}
                        />
                        <span className="text-sm font-bold text-white">
                          {parameterNameMap[alert.parameter] || alert.parameter}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-xs font-medium border border-red-500/30">
                          超标
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-xs font-medium border border-slate-600/50">
                          {alert.standardName}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin size={12} className="text-slate-500" />
                          <span>{alert.unit}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatTime(alert.timestamp)}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-0.5">当前值</div>
                          <div className="text-lg font-bold font-mono text-red-400">
                            {alert.value.toFixed(alert.parameter === 'ph' ? 1 : 2)}
                            <span className="text-xs text-slate-500 ml-1 font-normal">
                              {paramInfo.unit}
                            </span>
                          </div>
                        </div>
                        <div className="text-slate-600 text-lg">→</div>
                        <div>
                          <div className="text-xs text-slate-500 mb-0.5">限值</div>
                          <div className="text-lg font-bold font-mono text-slate-300">
                            {alert.limit.toFixed(alert.parameter === 'ph' ? 1 : 2)}
                            <span className="text-xs text-slate-500 ml-1 font-normal">
                              {paramInfo.unit}
                            </span>
                          </div>
                        </div>
                        <div className="ml-auto">
                          <div className="text-xs text-slate-500 mb-0.5">超出</div>
                          <div className="text-lg font-bold font-mono text-orange-400">
                            {alert.parameter === 'ph'
                              ? `${Math.abs(alert.value - alert.limit).toFixed(1)}`
                              : `${(((alert.value - alert.limit) / alert.limit) * 100).toFixed(1)}%`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => locateAlert(alert)}
                      className="shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40 flex items-center gap-1.5"
                    >
                      <MapPin size={14} />
                      定位
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
