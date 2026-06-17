import { useEffect, useState } from 'react';
import { X, ChevronRight, Play, Pause } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { TreatmentUnitType } from '../../types';
import { UNIT_NAMES } from '../../utils/constants';
import { useWaterQuality } from '../../hooks/useWaterQuality';

interface TeachingModeProps {
  unitId: TreatmentUnitType | null;
  onClose: () => void;
}

export function TeachingMode({ unitId, onClose }: TeachingModeProps) {
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  
  const unit = unitId ? useSimulationStore((state) => state.units[unitId]) : null;
  const { parameterStatus, treatmentEfficiency } = useWaterQuality(unitId || undefined);

  useEffect(() => {
    if (!unitId || !isAnimating) return;

    const interval = setInterval(() => {
      setAnimationStep((prev) => {
        if (!unit) return 0;
        return (prev + 1) % unit.processes.length;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [unitId, isAnimating, unit]);

  useEffect(() => {
    setAnimationStep(0);
  }, [unitId]);

  if (!unitId || !unit) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4">
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full animate-pulse"
              style={{ backgroundColor: unit.color }}
            />
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {unit.name} - 工作原理
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {isAnimating ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-slate-300 leading-relaxed mb-6">
            {unit.workingPrinciple}
          </p>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">处理流程</h3>
            <div className="flex items-stretch gap-1">
              {unit.processes.map((process, index) => (
                <div
                  key={index}
                  className={`flex-1 flex items-center gap-2 px-3 py-3 rounded-xl transition-all duration-500 ${
                    index === animationStep
                      ? 'bg-cyan-500/30 border border-cyan-500/50 scale-105'
                      : index < animationStep
                      ? 'bg-emerald-500/20 border border-emerald-500/30'
                      : 'bg-slate-700/30 border border-slate-600/30'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      index === animationStep
                        ? 'bg-cyan-500 text-white'
                        : index < animationStep
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-600 text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      index === animationStep
                        ? 'text-cyan-300'
                        : index < animationStep
                        ? 'text-emerald-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {process}
                  </span>
                  {index < unit.processes.length - 1 && (
                    <ChevronRight className="ml-auto text-slate-600" size={16} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {(['cod', 'ammoniaNitrogen', 'totalPhosphorus', 'ph'] as const).map((key) => {
              const status = parameterStatus[key] as { value: number; isOk: boolean; limit: number } | undefined;
              if (!status) return null;
              
              const paramInfoMap: Record<string, { name: string; unit: string; color: string }> = {
                cod: { name: 'COD', unit: 'mg/L', color: '#ff6b6b' },
                ammoniaNitrogen: { name: '氨氮', unit: 'mg/L', color: '#4ecdc4' },
                totalPhosphorus: { name: '总磷', unit: 'mg/L', color: '#ffe66d' },
                ph: { name: 'pH', unit: '', color: '#95e1d3' },
              };
              const paramInfo = paramInfoMap[key];

              return (
                <div
                  key={key}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                  <div className="text-xs text-slate-400 mb-1">{paramInfo.name}</div>
                  <div
                    className="text-xl font-bold"
                    style={{ color: status.isOk ? paramInfo.color : '#e71d36' }}
                  >
                    {status.value.toFixed(key === 'ph' ? 1 : 1)}
                    <span className="text-xs text-slate-500 ml-1">{paramInfo.unit}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    限值: {status.limit.toFixed(key === 'ph' ? 1 : 1)}
                  </div>
                </div>
              );
            })}
          </div>

          {treatmentEfficiency && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-400 mb-3">本单元去除效率</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {treatmentEfficiency.cod.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">COD去除</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {treatmentEfficiency.ammoniaNitrogen.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">氨氮去除</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {treatmentEfficiency.totalPhosphorus.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">总磷去除</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
