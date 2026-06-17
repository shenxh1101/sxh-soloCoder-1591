import { QualityCard } from './QualityCard';
import { TREATMENT_UNIT_ORDER } from '../../utils/constants';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useWaterQuality } from '../../hooks/useWaterQuality';
import { ArrowRight, TrendingUp, Droplets } from 'lucide-react';

export function WaterQualityPanel() {
  const selectedUnit = useSimulationStore((state) => state.selectedUnit);
  const selectUnit = useSimulationStore((state) => state.selectUnit);
  const { overallEfficiency } = useWaterQuality();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl px-4">
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Droplets className="text-blue-400" size={20} />
            <h3 className="text-sm font-bold text-slate-300" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              水质监测面板
            </h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={16} />
              <span className="text-xs text-slate-400">总去除率:</span>
              <span className="text-sm font-bold text-emerald-400">
                COD {overallEfficiency?.cod.toFixed(1)}%
              </span>
              <ArrowRight size={14} className="text-slate-600" />
              <span className="text-sm font-bold text-cyan-400">
                氨氮 {overallEfficiency?.ammoniaNitrogen.toFixed(1)}%
              </span>
              <ArrowRight size={14} className="text-slate-600" />
              <span className="text-sm font-bold text-yellow-400">
                总磷 {overallEfficiency?.totalPhosphorus.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {TREATMENT_UNIT_ORDER.map((unitId, index) => (
            <div key={unitId} className="flex items-center">
              <QualityCard
                unitId={unitId}
                isSelected={selectedUnit === unitId}
                onClick={() => selectUnit(unitId)}
              />
              {index < TREATMENT_UNIT_ORDER.length - 1 && (
                <ArrowRight className="text-slate-600 mx-1 flex-shrink-0" size={20} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
