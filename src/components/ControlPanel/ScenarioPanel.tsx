import { useSimulationStore } from '../../store/useSimulationStore';
import { SCENARIO_PRESETS } from '../../utils/constants';
import { CheckCircle, Zap, Wind, Battery, Play, X } from 'lucide-react';
import { ScenarioPresetType } from '../../types';

const iconMap: Record<ScenarioPresetType, { Icon: typeof CheckCircle; color: string }> = {
  normal: { Icon: CheckCircle, color: 'text-emerald-400' },
  shockLoad: { Icon: Zap, color: 'text-yellow-400' },
  lowAeration: { Icon: Wind, color: 'text-blue-400' },
  powerRecovery: { Icon: Battery, color: 'text-orange-400' },
};

export function ScenarioPanel() {
  const activeScenario = useSimulationStore((state) => state.activeScenario);
  const showScenarioPanel = useSimulationStore((state) => state.showScenarioPanel);
  const applyScenario = useSimulationStore((state) => state.applyScenario);
  const setShowScenarioPanel = useSimulationStore((state) => state.setShowScenarioPanel);

  if (!showScenarioPanel) return null;

  return (
    <div className="fixed right-4 top-4 z-30 w-72">
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Play size={16} className="text-cyan-400" />
            工况预设
          </h3>
          <button
            onClick={() => setShowScenarioPanel(false)}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {SCENARIO_PRESETS.map((preset) => {
            const { Icon, color } = iconMap[preset.id as ScenarioPresetType];
            const isActive = activeScenario === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => applyScenario(preset.id as ScenarioPresetType)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 border ${
                  isActive
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm mb-1">
                      {preset.name}
                    </div>
                    <div className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                      {preset.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
