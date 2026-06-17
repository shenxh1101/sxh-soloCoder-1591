import { useEffect, useState, useMemo } from 'react';
import { X, ChevronRight, Play, Pause, ChevronLeft, Droplets, TrendingDown, Sparkles } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { TreatmentUnitType, WaterQuality } from '../../types';
import { UNIT_NAMES, TREATMENT_EFFICIENCY, UNIT_CONFIGS } from '../../utils/constants';
import { useWaterQuality } from '../../hooks/useWaterQuality';
import { getWaterColor } from '../../utils/waterTreatment';

interface TeachingModeProps {
  unitId: TreatmentUnitType | null;
  onClose: () => void;
}

interface ProcessStage {
  name: string;
  description: string;
  qualityChange: Partial<WaterQuality>;
}

export function TeachingMode({ unitId, onClose }: TeachingModeProps) {
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showProcessAnimation, setShowProcessAnimation] = useState(true);
  const [processStage, setProcessStage] = useState(0);
  const [isProcessAnimating, setIsProcessAnimating] = useState(true);
  
  const units = useSimulationStore((state) => state.units);
  const aerationIntensity = useSimulationStore((state) => state.aerationIntensity);
  const { parameterStatus, treatmentEfficiency, inletQuality, outletQuality } = useWaterQuality(unitId || undefined);
  
  const unit = unitId ? units[unitId] : null;

  const processStages = useMemo<ProcessStage[]>(() => {
    if (!unitId) return [];
    const efficiency = TREATMENT_EFFICIENCY[unitId];
    const aerationFactor = unitId === 'aerationTank' ? 0.5 + (aerationIntensity / 100) * 0.5 : 1;
    
    return [
      {
        name: '进水',
        description: '污水进入处理单元',
        qualityChange: { cod: 0, ammoniaNitrogen: 0, totalPhosphorus: 0, ph: 0 },
      },
      {
        name: '物理处理',
        description: '通过物理作用去除大颗粒污染物',
        qualityChange: {
          cod: -efficiency.cod * aerationFactor * 0.4,
          ammoniaNitrogen: -efficiency.ammoniaNitrogen * aerationFactor * 0.3,
          totalPhosphorus: -efficiency.totalPhosphorus * aerationFactor * 0.5,
          ph: 0,
        },
      },
      {
        name: '生物处理',
        description: '微生物降解有机污染物',
        qualityChange: {
          cod: -efficiency.cod * aerationFactor * 0.5,
          ammoniaNitrogen: -efficiency.ammoniaNitrogen * aerationFactor * 0.6,
          totalPhosphorus: -efficiency.totalPhosphorus * aerationFactor * 0.4,
          ph: 0.1,
        },
      },
      {
        name: '化学处理',
        description: '通过化学反应进一步净化',
        qualityChange: {
          cod: -efficiency.cod * aerationFactor * 0.1,
          ammoniaNitrogen: -efficiency.ammoniaNitrogen * aerationFactor * 0.1,
          totalPhosphorus: -efficiency.totalPhosphorus * aerationFactor * 0.1,
          ph: -0.05,
        },
      },
      {
        name: '出水',
        description: '处理完成，进入下一单元',
        qualityChange: { cod: 0, ammoniaNitrogen: 0, totalPhosphorus: 0, ph: 0 },
      },
    ];
  }, [unitId, aerationIntensity]);

  const animatedQuality = useMemo((): WaterQuality => {
    if (!inletQuality) return { cod: 0, ammoniaNitrogen: 0, totalPhosphorus: 0, ph: 7 };
    
    const quality = { ...inletQuality };
    for (let i = 0; i <= processStage; i++) {
      const change = processStages[i]?.qualityChange || {};
      if (change.cod) quality.cod = Math.max(5, quality.cod * (1 + change.cod));
      if (change.ammoniaNitrogen) quality.ammoniaNitrogen = Math.max(0.1, quality.ammoniaNitrogen * (1 + change.ammoniaNitrogen));
      if (change.totalPhosphorus) quality.totalPhosphorus = Math.max(0.05, quality.totalPhosphorus * (1 + change.totalPhosphorus));
      if (change.ph) quality.ph = Math.max(6, Math.min(9, quality.ph + change.ph));
    }
    return quality;
  }, [inletQuality, processStage, processStages]);

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
    if (!showProcessAnimation || !isProcessAnimating) return;

    const interval = setInterval(() => {
      setProcessStage((prev) => (prev + 1) % processStages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [showProcessAnimation, isProcessAnimating, processStages.length]);

  useEffect(() => {
    setAnimationStep(0);
    setProcessStage(0);
  }, [unitId]);

  if (!unitId || !unit) return null;

  const animatedWaterColor = getWaterColor(animatedQuality.cod);
  const inletColor = inletQuality ? getWaterColor(inletQuality.cod) : '#8b4513';
  const outletColor = outletQuality ? getWaterColor(outletQuality.cod) : '#2ec4b6';

  const handlePrevStage = () => {
    setIsProcessAnimating(false);
    setProcessStage((prev) => Math.max(0, prev - 1));
  };

  const handleNextStage = () => {
    setIsProcessAnimating(false);
    setProcessStage((prev) => Math.min(processStages.length - 1, prev + 1));
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-5xl px-4">
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
              onClick={() => setShowProcessAnimation(!showProcessAnimation)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showProcessAnimation
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {showProcessAnimation ? '隐藏动画' : '显示动画'}
            </button>
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

        <div className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed">
            {unit.workingPrinciple}
          </p>

          {showProcessAnimation && (
            <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <Sparkles size={16} />
                  工艺动画演示
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevStage}
                    disabled={processStage === 0}
                    className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setIsProcessAnimating(!isProcessAnimating)}
                    className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    {isProcessAnimating ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={handleNextStage}
                    disabled={processStage === processStages.length - 1}
                    className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-stretch gap-4">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div
                    className="w-16 h-16 rounded-full border-4 border-slate-600 flex items-center justify-center transition-all duration-500"
                    style={{ backgroundColor: inletColor }}
                  >
                    <Droplets size={24} className="text-white/80" />
                  </div>
                  <span className="text-xs text-slate-400">进水</span>
                  {inletQuality && (
                    <span className="text-xs font-mono text-slate-500">
                      COD: {inletQuality.cod.toFixed(0)}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-stretch gap-1 mb-3">
                    {processStages.map((stage, index) => (
                      <div
                        key={index}
                        className={`flex-1 flex flex-col items-center justify-center px-2 py-3 rounded-xl transition-all duration-500 ${
                          index === processStage
                            ? 'bg-cyan-500/30 border border-cyan-500/50 scale-105'
                            : index < processStage
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-slate-700/30 border border-slate-600/30'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1 ${
                            index === processStage
                              ? 'bg-cyan-500 text-white animate-pulse'
                              : index < processStage
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-600 text-slate-400'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span
                          className={`text-xs font-medium text-center ${
                            index === processStage
                              ? 'text-cyan-300'
                              : index < processStage
                              ? 'text-emerald-300'
                              : 'text-slate-400'
                          }`}
                        >
                          {stage.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full border-3 transition-all duration-500"
                        style={{ 
                          backgroundColor: animatedWaterColor,
                          borderColor: processStage > 0 ? '#2ec4b6' : '#64748b',
                          borderWidth: '3px'
                        }}
                      />
                      <div>
                        <div className="text-sm text-slate-300 font-medium">
                          {processStages[processStage]?.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {processStages[processStage]?.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold font-mono text-red-400">
                          {animatedQuality.cod.toFixed(0)}
                        </div>
                        <div className="text-xs text-slate-500">COD</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold font-mono text-cyan-400">
                          {animatedQuality.ammoniaNitrogen.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500">氨氮</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold font-mono text-yellow-400">
                          {animatedQuality.totalPhosphorus.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500">总磷</div>
                      </div>
                      <TrendingDown className="text-emerald-400" size={20} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                  <div
                    className="w-16 h-16 rounded-full border-4 border-emerald-500/50 flex items-center justify-center transition-all duration-500"
                    style={{ backgroundColor: outletColor }}
                  >
                    <Sparkles size={24} className="text-white/80" />
                  </div>
                  <span className="text-xs text-slate-400">出水</span>
                  {outletQuality && (
                    <span className="text-xs font-mono text-emerald-400">
                      COD: {outletQuality.cod.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-600/30">
                <div className="grid grid-cols-5 gap-2">
                  {processStages.map((stage, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg text-center transition-all ${
                        index === processStage
                          ? 'bg-cyan-500/20 border border-cyan-500/30'
                          : 'bg-slate-700/20'
                      }`}
                    >
                      <div className="text-xs font-medium text-slate-300 mb-1">{stage.name}</div>
                      <div className="text-xs text-slate-500">{stage.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
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
            <div className="pt-4 border-t border-slate-700/50">
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
