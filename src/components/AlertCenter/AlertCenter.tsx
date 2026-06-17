import { useMemo, ReactNode } from 'react';
import { AlertTriangle, Filter, MapPin, X, Search, AlertCircle, Lightbulb, Eye, XCircle } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { UNIT_NAMES, PARAMETER_INFO, TREATMENT_UNIT_ORDER, getAlertDisposalInfo } from '../../utils/constants';
import { AlertRecord, TreatmentUnitType, AlertDisposalInfo } from '../../types';
import { cn } from '../../lib/utils';

const KEYWORD_HIGHLIGHTS: Record<string, string> = {
  '增加曝气': 'text-teal-400',
  '提高溶解氧': 'text-teal-400',
  '提高DO': 'text-teal-400',
  '曝气强度': 'text-teal-400',
  '曝气': 'text-teal-400',
  '降低进水': 'text-sky-400',
  '进水流量': 'text-sky-400',
  '进水负荷': 'text-sky-400',
  '进水': 'text-sky-400',
  '投加': 'text-violet-400',
  '药剂': 'text-violet-400',
  'PAC': 'text-violet-400',
  'PFS': 'text-violet-400',
  '碳酸氢钠': 'text-violet-400',
  '液碱': 'text-violet-400',
  '石灰': 'text-violet-400',
  '硫酸': 'text-violet-400',
  '盐酸': 'text-violet-400',
  '甲醇': 'text-violet-400',
  '乙酸钠': 'text-violet-400',
  '消毒剂': 'text-violet-400',
  '混凝剂': 'text-violet-400',
  '菌剂': 'text-violet-400',
  '检查': 'text-amber-400',
  '检修': 'text-amber-400',
  '修复': 'text-amber-400',
  '清理': 'text-amber-400',
  '清渣': 'text-amber-400',
  '排泥': 'text-amber-400',
  '排砂': 'text-amber-400',
  '排放': 'text-amber-400',
  '污泥回流': 'text-orange-400',
  '回流比': 'text-orange-400',
  '回流': 'text-orange-400',
  '剩余污泥': 'text-orange-400',
  '污泥': 'text-orange-400',
  'MLSS': 'text-orange-400',
  '污泥龄': 'text-orange-400',
  'SVI': 'text-orange-400',
  '调整': 'text-yellow-400',
  '控制': 'text-yellow-400',
  '优化': 'text-yellow-400',
  '稳定': 'text-yellow-400',
  'pH': 'text-emerald-400',
  '碱度': 'text-emerald-400',
  '温度': 'text-rose-400',
  '水温': 'text-rose-400',
  '碳源': 'text-pink-400',
  '营养': 'text-pink-400',
  '停留时间': 'text-cyan-400',
  '停留': 'text-cyan-400',
  '溶解氧': 'text-teal-400',
  'DO': 'text-teal-400',
  '厌氧': 'text-red-400',
  '好氧': 'text-green-400',
  '缺氧': 'text-indigo-400',
  '聚磷菌': 'text-lime-400',
  '硝化': 'text-cyan-400',
  '反硝化': 'text-cyan-400',
  '丝状菌': 'text-fuchsia-400',
  '膨胀': 'text-fuchsia-400',
};

function highlightKeywords(text: string): ReactNode {
  const sortedKeywords = Object.keys(KEYWORD_HIGHLIGHTS).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${sortedKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const colorClass = KEYWORD_HIGHLIGHTS[part];
    if (colorClass) {
      return (
        <span key={i} className={cn('font-semibold', colorClass)}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function getSeverityStyles(severity: 'low' | 'medium' | 'high') {
  switch (severity) {
    case 'high':
      return {
        border: 'border-red-500/60',
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        badgeBg: 'bg-red-500/20',
        badgeBorder: 'border-red-500/40',
        label: '高风险',
      };
    case 'medium':
      return {
        border: 'border-orange-500/60',
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        badgeBg: 'bg-orange-500/20',
        badgeBorder: 'border-orange-500/40',
        label: '中风险',
      };
    case 'low':
      return {
        border: 'border-yellow-500/60',
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        badgeBg: 'bg-yellow-500/20',
        badgeBorder: 'border-yellow-500/40',
        label: '低风险',
      };
  }
}

export function AlertCenter() {
  const alertRecords = useSimulationStore((state) => state.alertRecords);
  const alertFilter = useSimulationStore((state) => state.alertFilter);
  const highlightedUnit = useSimulationStore((state) => state.highlightedUnit);
  const selectedAlert = useSimulationStore((state) => state.selectedAlert);
  const setAlertFilter = useSimulationStore((state) => state.setAlertFilter);
  const setShowAlertCenter = useSimulationStore((state) => state.setShowAlertCenter);
  const locateAlert = useSimulationStore((state) => state.locateAlert);
  const setSelectedAlert = useSimulationStore((state) => state.setSelectedAlert);
  const selectUnit = useSimulationStore((state) => state.selectUnit);

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

  const getExcessMultiple = (alert: AlertRecord) => {
    if (alert.parameter === 'ph') {
      return Math.abs(alert.value - alert.limit);
    }
    return ((alert.value - alert.limit) / alert.limit) * 100;
  };

  const getExcessLabel = (alert: AlertRecord) => {
    if (alert.parameter === 'ph') {
      return `偏离 ${getExcessMultiple(alert).toFixed(1)}`;
    }
    return `超 ${getExcessMultiple(alert).toFixed(1)}%`;
  };

  const getExcessColorClass = (alert: AlertRecord) => {
    const multiple = getExcessMultiple(alert);
    if (alert.parameter === 'ph') {
      if (multiple > 1.5) return 'bg-red-500/20 text-red-300 border-red-500/30';
      if (multiple > 0.8) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
    if (multiple > 100) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (multiple > 50) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  };

  const handleAlertClick = (alert: AlertRecord) => {
    locateAlert(alert);
  };

  const handleViewUnitDetail = () => {
    if (selectedAlert) {
      const unitId = unitNameToId[selectedAlert.unit];
      if (unitId) {
        selectUnit(unitId);
      }
    }
    setShowAlertCenter(false);
  };

  const handleCloseAlert = () => {
    setSelectedAlert(null);
  };

  const disposalInfo: AlertDisposalInfo | null = useMemo(() => {
    if (!selectedAlert) return null;
    const unitId = unitNameToId[selectedAlert.unit];
    if (!unitId) return null;
    return getAlertDisposalInfo(unitId, selectedAlert.parameter, selectedAlert.value, selectedAlert.limit);
  }, [selectedAlert, unitNameToId]);

  const renderAlertRow = (alert: AlertRecord, index: number) => {
    const paramInfo = getParameterInfo(alert.parameter);
    const alertUnitId = unitNameToId[alert.unit];
    const isHighlighted = highlightedUnit === alertUnitId;
    const isSelected = selectedAlert?.timestamp === alert.timestamp && selectedAlert?.unit === alert.unit && selectedAlert?.parameter === alert.parameter;

    return (
      <div
        key={`${alert.timestamp}-${index}`}
        onClick={() => handleAlertClick(alert)}
        className={cn(
          'rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer',
          isSelected
            ? 'bg-gradient-to-r from-cyan-500/25 via-cyan-500/15 to-transparent border-cyan-500/60 shadow-lg shadow-cyan-500/20'
            : isHighlighted
            ? 'bg-gradient-to-r from-red-500/30 via-red-500/20 to-transparent border-red-500/60 shadow-lg shadow-red-500/20'
            : 'bg-slate-800/50 border-slate-700/50 hover:border-red-500/40 hover:bg-slate-800/70'
        )}
      >
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
                  style={{ backgroundColor: paramInfo.color }}
                />
                <span className="text-sm font-bold text-white">
                  {parameterNameMap[alert.parameter] || alert.parameter}
                </span>
                <span className={cn(
                  'px-2 py-0.5 rounded-md text-xs font-medium border',
                  getExcessColorClass(alert)
                )}>
                  {getExcessLabel(alert)}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-xs font-medium border border-slate-600/50">
                  {alert.standardName}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin size={12} className="text-slate-500 shrink-0" />
                  <span>{alert.unit}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {formatTime(alert.timestamp)}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">实测值</div>
                  <div className="text-lg font-bold font-mono text-red-400">
                    {alert.value.toFixed(alert.parameter === 'ph' ? 1 : 2)}
                    <span className="text-xs text-slate-500 ml-1 font-normal">
                      {paramInfo.unit}
                    </span>
                  </div>
                </div>
                <div className="text-slate-600 text-lg">/</div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">限值</div>
                  <div className="text-lg font-bold font-mono text-slate-300">
                    {alert.limit.toFixed(alert.parameter === 'ph' ? 1 : 2)}
                    <span className="text-xs text-slate-500 ml-1 font-normal">
                      {paramInfo.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                locateAlert(alert);
              }}
              className="shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40 flex items-center gap-1.5"
            >
              <MapPin size={14} />
              定位
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDisposalGuide = () => {
    if (!selectedAlert || !disposalInfo) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-5">
            <AlertCircle size={40} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-400 mb-2">选择报警查看处置指南</h3>
          <p className="text-sm text-slate-600">点击左侧报警列表中的任意条目，即可查看详细原因分析和建议操作</p>
        </div>
      );
    }

    const severityStyles = getSeverityStyles(disposalInfo.severity);
    const paramInfo = getParameterInfo(selectedAlert.parameter);

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-800/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                {disposalInfo.unitName} · {disposalInfo.parameterName}
              </h2>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                  severityStyles.badgeBg,
                  severityStyles.text,
                  severityStyles.badgeBorder
                )}>
                  {severityStyles.label}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-700/50 text-slate-300 text-xs border border-slate-600/50">
                  {selectedAlert.standardName}
                </span>
              </div>
            </div>
            <button
              onClick={handleCloseAlert}
              className="shrink-0 p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="关闭处置讲解"
            >
              <XCircle size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className={cn(
            'rounded-xl border-2 p-4',
            severityStyles.border,
            severityStyles.bg
          )}>
            <div className="text-xs text-slate-400 mb-3 font-medium">超标详情</div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">实测值</div>
                <div className={cn('text-2xl font-bold font-mono', severityStyles.text)}>
                  {selectedAlert.value.toFixed(selectedAlert.parameter === 'ph' ? 1 : 2)}
                  <span className="text-xs text-slate-500 ml-1 font-normal">{paramInfo.unit}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">限值</div>
                <div className="text-2xl font-bold font-mono text-slate-300">
                  {selectedAlert.limit.toFixed(selectedAlert.parameter === 'ph' ? 1 : 2)}
                  <span className="text-xs text-slate-500 ml-1 font-normal">{paramInfo.unit}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">{selectedAlert.parameter === 'ph' ? '偏离值' : '超标率'}</div>
                <div className={cn('text-2xl font-bold font-mono', severityStyles.text)}>
                  {selectedAlert.parameter === 'ph'
                    ? `${Math.abs(selectedAlert.value - selectedAlert.limit).toFixed(1)}`
                    : `${(((selectedAlert.value - selectedAlert.limit) / selectedAlert.limit) * 100).toFixed(1)}%`}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', severityStyles.badgeBg)}>
                <AlertCircle size={16} className={severityStyles.text} />
              </div>
              <h3 className="text-base font-bold text-white">原因分析</h3>
            </div>
            <div className="space-y-2.5 pl-1">
              {disposalInfo.causes.map((cause, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                    i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                  )} />
                  <p className="text-sm text-slate-300 leading-relaxed">{highlightKeywords(cause)}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <Lightbulb size={16} className="text-teal-400" />
              </div>
              <h3 className="text-base font-bold text-white">建议操作</h3>
            </div>
            <div className="space-y-2.5">
              {disposalInfo.suggestions.map((suggestion, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-teal-500/40 transition-colors"
                >
                  <span className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                    i === 0 ? 'bg-teal-500/20 text-teal-400' :
                    i === 1 ? 'bg-cyan-500/20 text-cyan-400' :
                    i === 2 ? 'bg-sky-500/20 text-sky-400' :
                    i === 3 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-indigo-500/20 text-indigo-400'
                  )}>
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed">{highlightKeywords(suggestion)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-700/50 bg-slate-800/50 space-y-2">
          <button
            onClick={handleViewUnitDetail}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-semibold hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            查看构筑物详情
          </button>
          <button
            onClick={handleCloseAlert}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-700/60 text-slate-300 text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <XCircle size={16} />
            关闭报警
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-20 z-40 w-full max-w-7xl max-h-[78vh] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden">
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
            onClick={() => {
              setSelectedAlert(null);
              setShowAlertCenter(false);
            }}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Filter size={14} className="text-slate-500 shrink-0" />
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
            <Search size={14} className="text-slate-500 shrink-0" />
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

      <div className="flex flex-col lg:flex-row" style={{ maxHeight: 'calc(78vh - 132px)' }}>
        <div className="w-full lg:w-[70%] lg:border-r border-slate-700/50 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredAlerts.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                  <AlertTriangle size={32} className="text-slate-600" />
                </div>
                <p className="text-slate-400 font-medium">暂无报警记录</p>
                <p className="text-slate-600 text-sm mt-1">系统运行正常，保持关注</p>
              </div>
            ) : (
              filteredAlerts.map((alert: AlertRecord, index: number) => renderAlertRow(alert, index))
            )}
          </div>
        </div>

        <div className="w-full lg:w-[30%] min-h-[300px] lg:min-h-0 lg:h-auto overflow-hidden border-t lg:border-t-0 border-slate-700/50 bg-slate-900/50">
          {renderDisposalGuide()}
        </div>
      </div>
    </div>
  );
}
