import { TreatmentUnitType, ParameterType } from '../../types';
import { useWaterQuality } from '../../hooks/useWaterQuality';
import { UNIT_NAMES } from '../../utils/constants';

interface QualityCardProps {
  unitId: TreatmentUnitType;
  isSelected: boolean;
  onClick: () => void;
}

export function QualityCard({ unitId, isSelected, onClick }: QualityCardProps) {
  const { currentQuality, parameterStatus, isAlert } = useWaterQuality(unitId);

  if (!currentQuality) return null;

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

  return (
    <div
      onClick={onClick}
      className={`relative flex-shrink-0 w-48 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
        isAlert
          ? 'bg-red-500/20 border-2 border-red-500/60 animate-pulse'
          : isSelected
          ? 'bg-slate-800/80 border-2 border-cyan-500/60 scale-105'
          : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          {UNIT_NAMES[unitId]}
        </h3>
        {isAlert && (
          <span className="text-xs font-bold text-red-400 px-2 py-0.5 bg-red-500/20 rounded-full">
            超标
          </span>
        )}
      </div>

      <div className="space-y-2">
        {(['cod', 'ammoniaNitrogen', 'totalPhosphorus', 'ph'] as const).map((key) => {
          const status = parameterStatus[key] as { value: number; isOk: boolean; limit: number } | undefined;
          if (!status) return null;
          
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

          return (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{paramNames[key]}</span>
              <div className="flex items-center gap-1">
                <span
                  className="font-mono font-bold"
                  style={{ color: getParameterColor(key, status) }}
                >
                  {status.value.toFixed(key === 'ph' ? 1 : 1)}
                  <span className="text-slate-500 ml-0.5 text-[10px]">{paramUnits[key]}</span>
                </span>
                {!status.isOk && (
                  <span className="text-red-400 text-[10px]">!</span>
                )}
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
