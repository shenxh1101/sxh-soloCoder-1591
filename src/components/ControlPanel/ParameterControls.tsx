import { Play, Pause, RotateCcw, Settings, FileText, GraduationCap, AlertTriangle, Camera, Layers } from 'lucide-react';
import { Slider } from '../UI/Slider';
import { useSimulationStore } from '../../store/useSimulationStore';
import { SIMULATION_CONFIG } from '../../utils/constants';
import { SCENARIO_PRESETS } from '../../utils/constants';
import { useState } from 'react';

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
  const alertRecords = useSimulationStore((state) => state.alertRecords);
  const activeScenario = useSimulationStore((state) => state.activeScenario);
  const isReplaying = useSimulationStore((state) => state.isReplaying);
  
  const setInflowRate = useSimulationStore((state) => state.setInflowRate);
  const setAerationIntensity = useSimulationStore((state) => state.setAerationIntensity);
  const toggleRunning = useSimulationStore((state) => state.toggleRunning);
  const toggleTeachingMode = useSimulationStore((state) => state.toggleTeachingMode);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);
  const setShowAlertCenter = useSimulationStore((state) => state.setShowAlertCenter);
  const saveSnapshot = useSimulationStore((state) => state.saveSnapshot);
  const applyScenario = useSimulationStore((state) => state.applyScenario);

  const [showScenarios, setShowScenarios] = useState(false);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const unreadAlerts = alertRecords.length;

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
          <button
            onClick={() => setShowAlertCenter(true)}
            className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-400" />
              <span className="text-sm">报警中心</span>
            </div>
            {unreadAlerts > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {unreadAlerts > 99 ? '99+' : unreadAlerts}
              </span>
            )}
          </button>
          <button
            onClick={() => saveSnapshot()}
            className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
          >
            <Camera size={18} className="text-yellow-400" />
            <span className="text-sm">保存快照</span>
          </button>
          <button
            onClick={() => setShowScenarios(!showScenarios)}
            className={`flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 ${
              showScenarios
                ? 'bg-orange-500/20 border border-orange-500/40 text-orange-300'
                : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white'
            }`}
          >
            <Layers size={18} className="text-orange-400" />
            <span className="text-sm">工况预设</span>
          </button>
        </div>

        {showScenarios && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
            {SCENARIO_PRESETS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => applyScenario(scenario.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                  activeScenario === scenario.id
                    ? 'bg-cyan-500/20 border border-cyan-500/40'
                    : 'bg-slate-800/30 hover:bg-slate-700/30 border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  scenario.id === 'normal' ? 'bg-emerald-500/20' :
                  scenario.id === 'shockLoad' ? 'bg-yellow-500/20' :
                  scenario.id === 'lowAeration' ? 'bg-blue-500/20' :
                  'bg-orange-500/20'
                }`}>
                  <Layers size={16} className={
                    scenario.id === 'normal' ? 'text-emerald-400' :
                    scenario.id === 'shockLoad' ? 'text-yellow-400' :
                    scenario.id === 'lowAeration' ? 'text-blue-400' :
                    'text-orange-400'
                  } />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    {scenario.name}
                    {activeScenario === scenario.id && (
                      <span className="text-xs px-1.5 py-0.5 bg-cyan-500/30 text-cyan-400 rounded">激活</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{scenario.description}</div>
                  <div className="flex gap-2 mt-1 text-xs text-slate-600">
                    <span>流量:{scenario.inflowRate}</span>
                    <span>曝气:{scenario.aerationIntensity}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {isTeachingMode && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <p className="text-cyan-300 text-sm text-center">
            💡 教学模式已开启，点击任意构筑物查看工作原理
          </p>
        </div>
      )}

      {isReplaying && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <p className="text-purple-300 text-sm text-center animate-pulse">
            ⏮ 回放模式中 - 加载的快照数据
          </p>
        </div>
      )}
    </div>
  );
}
