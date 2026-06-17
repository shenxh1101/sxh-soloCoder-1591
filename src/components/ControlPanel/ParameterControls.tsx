import { Play, Pause, RotateCcw, Settings, FileText, GraduationCap } from 'lucide-react';
import { Slider } from '../UI/Slider';
import { useSimulationStore } from '../../store/useSimulationStore';
import { SIMULATION_CONFIG } from '../../utils/constants';

interface ParameterControlsProps {
  onOpenStandard: () => void;
  onGenerateReport: () => void;
}

export function ParameterControls({ onOpenStandard, onGenerateReport }: ParameterControlsProps) {
  const inflowRate = useSimulationStore((state) => state.inflowRate);
  const aerationIntensity = useSimulationStore((state) => state.aerationIntensity);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const isTeachingMode = useSimulationStore((state) => state.isTeachingMode);
  const simulationTime = useSimulationStore((state) => state.simulationTime);
  const dailyTreatmentVolume = useSimulationStore((state) => state.dailyTreatmentVolume);
  
  const setInflowRate = useSimulationStore((state) => state.setInflowRate);
  const setAerationIntensity = useSimulationStore((state) => state.setAerationIntensity);
  const toggleRunning = useSimulationStore((state) => state.toggleRunning);
  const toggleTeachingMode = useSimulationStore((state) => state.toggleTeachingMode);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed left-4 top-4 z-30 w-72 space-y-4">
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          运行控制
        </h2>

        <div className="space-y-5">
          <Slider
            label="进水流量"
            value={inflowRate}
            min={SIMULATION_CONFIG.minInflowRate}
            max={SIMULATION_CONFIG.maxInflowRate}
            unit=" m³/h"
            onChange={setInflowRate}
            color="#3e92cc"
          />

          <Slider
            label="曝气强度"
            value={aerationIntensity}
            min={SIMULATION_CONFIG.minAerationIntensity}
            max={SIMULATION_CONFIG.maxAerationIntensity}
            unit=" %"
            onChange={setAerationIntensity}
            color="#fb5607"
          />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={toggleRunning}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {isRunning ? '暂停' : '运行'}
            </button>
            <button
              onClick={resetSimulation}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200"
            >
              <RotateCcw size={18} />
              重置
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 shadow-2xl">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">运行时间</span>
            <span className="text-white font-mono font-bold">{formatTime(simulationTime)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">日处理量</span>
            <span className="text-emerald-400 font-mono font-bold">{dailyTreatmentVolume.toFixed(1)} m³</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 shadow-2xl">
        <h3 className="text-sm font-bold text-slate-300 mb-3">系统功能</h3>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={onOpenStandard}
            className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
          >
            <Settings size={18} className="text-blue-400" />
            <span className="text-sm">排放标准配置</span>
          </button>
          <button
            onClick={onGenerateReport}
            className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
          >
            <FileText size={18} className="text-emerald-400" />
            <span className="text-sm">生成处理日报</span>
          </button>
          <button
            onClick={toggleTeachingMode}
            className={`flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 ${
              isTeachingMode
                ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white'
            }`}
          >
            <GraduationCap size={18} className={isTeachingMode ? 'text-cyan-400' : 'text-purple-400'} />
            <span className="text-sm">{isTeachingMode ? '退出教学模式' : '进入教学模式'}</span>
          </button>
        </div>
      </div>

      {isTeachingMode && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <p className="text-cyan-300 text-sm text-center">
            💡 教学模式已开启，点击任意构筑物查看工作原理
          </p>
        </div>
      )}
    </div>
  );
}
