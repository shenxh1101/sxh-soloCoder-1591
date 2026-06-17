import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TreatmentUnitType, ParameterType } from '../../types';
import { useWaterQuality } from '../../hooks/useWaterQuality';
import { UNIT_NAMES } from '../../utils/constants';

interface QualityCardProps {
  unitId: TreatmentUnitType;
  isSelected: boolean;
  onClick: () => void;
}

interface ParameterState {
  value: number;
  isOk: boolean;
  limit: number;
  previousValue?: number;
}

export function QualityCard({ unitId, isSelected, onClick }: QualityCardProps) {
  const { currentQuality, parameterStatus, isAlert, historyForUnit } = useWaterQuality(unitId);
  const [displayValues, setDisplayValues] = useState<Record<string, number>>({});
  const previousValues = useRef<Record<string, number>>({});
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!currentQuality) return;
    
    const newValues: Record<string, number> = {
      cod: currentQuality.cod,
      ammoniaNitrogen: currentQuality.ammoniaNitrogen,
      totalPhosphorus: currentQuality.totalPhosphorus,
      ph: currentQuality.ph,
    };

    if (Object.keys(displayValues).length === 0) {
      setDisplayValues(newValues);
      previousValues.current = { ...newValues };
      return;
    }

    const startValues = { ...displayValues };
    const startTime = Date.now();
    const duration = 500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const interpolated: Record<string, number> = {};
      Object.keys(newValues).forEach((key) => {
        interpolated[key] = startValues[key] + (newValues[key] - startValues[key]) * easeProgress;
      });

      setDisplayValues(interpolated);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValues.current = { ...newValues };
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentQuality]);

  if (!currentQuality) return null;

  const getTrend = (key: ParameterType): 'up' | 'down' | 'stable' => {
    const current = displayValues[key];
    const previous = previousValues.current[key];
    if (previous === undefined || current === undefined) return 'stable';
    const diff = current - previous;
    const threshold = key === 'ph' ? 0.01 : 0.1;
    if (Math.abs(diff) < threshold) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const getParameterColor = (key: ParameterType, status: { isOk: boolean }) => {
    if (!status.isOk) return '#e71d36';
    const colors: Record<ParameterType, string> = {
      cod: '#ff6b6b',
      ammoniaNitrogen: '#4ecdc4',
      totalPhosphorus: '#ffe66d',
      ph: '#95e1d3',
    };
    return colors[key];
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', key: ParameterType) => {
    if (key === 'ph') {
      return trend === 'stable' ? '#22c55e' : '#f59e0b';
    }
    if (trend === 'down') return '#22c55e';
    if (trend === 'up') return '#ef4444';
    return '#6b7280';
  };

  return (
    <div
      onClick={onClick}
      className={`relative flex-shrink-0 w-52 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
        isAlert
          ? 'bg-red-500/20 border-2 border-red-500/60'
          : isSelected
          ? 'bg-slate-800/80 border-2 border-cyan-500/60 scale-105 shadow-lg shadow-cyan-500/20'
          : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/50 hover:shadow-lg hover:shadow-slate-900/50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          {UNIT_NAMES[unitId]}
        </h3>
        {isAlert && (
          <span className="text-xs font-bold text-red-400 px-2 py-0.5 bg-red-500/20 rounded-full animate-pulse">
            超标
          </span>
        )}
      </div>

      <div className="space-y-3">
        {(['cod', 'ammoniaNitrogen', 'totalPhosphorus', 'ph'] as const).map((key) => {
          const status = parameterStatus[key] as ParameterState | undefined;
          if (!status) return null;
          
          const displayValue = displayValues[key] ?? status.value;
          const trend = getTrend(key);
          
          const paramNames: Record<ParameterType, string> = {
            cod: 'COD',
            ammoniaNitrogen: '氨氮',
            totalPhosphorus: '总磷',
            ph: 'pH',
          };
          const paramUnits: Record<ParameterType, string> = {
            cod: 'mg/L',
            ammoniaNitrogen: 'mg/L',
            totalPhosphorus: 'mg/L',
            ph: '',
          };

          const progress = key === 'ph' 
            ? Math.min(1, Math.max(0, (status.value - 6) / 3))
            : Math.min(1, status.value / status.limit);

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{paramNames[key]}</span>
                <div className="flex items-center gap-1">
                  <span
                    className="font-mono font-bold text-sm transition-all duration-200"
                    style={{ 
                      color: getParameterColor(key, status),
                      textShadow: status.isOk ? 'none' : `0 0 8px ${getParameterColor(key, status)}`
                    }}
                  >
                    {displayValue.toFixed(key === 'ph' ? 1 : 1)}
                    <span className="text-slate-500 ml-0.5 text-[10px]">{paramUnits[key]}</span>
                  </span>
                  {trend === 'up' && (
                    <TrendingUp size={12} style={{ color: getTrendColor(trend, key) }} className="animate-bounce" />
                  )}
                  {trend === 'down' && (
                    <TrendingDown size={12} style={{ color: getTrendColor(trend, key) }} className="animate-bounce" />
                  )}
                  {trend === 'stable' && (
                    <Minus size={12} style={{ color: getTrendColor(trend, key) }} />
                  )}
                  {!status.isOk && (
                    <span className="text-red-400 text-[10px] font-bold animate-pulse">!</span>
                  )}
                </div>
              </div>
              <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress * 100}%`,
                    backgroundColor: progress > 0.9 ? '#ef4444' : progress > 0.7 ? '#f59e0b' : getParameterColor(key, status),
                    boxShadow: `0 0 6px ${progress > 0.9 ? '#ef4444' : progress > 0.7 ? '#f59e0b' : getParameterColor(key, status)}`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>0</span>
                <span>限值: {status.limit.toFixed(key === 'ph' ? 1 : 1)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {isSelected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
      )}
    </div>
  );
}
