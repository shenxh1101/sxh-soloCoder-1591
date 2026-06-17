import { useState } from 'react';
import { Camera, Play, Trash2, X, Save, Clock, Activity } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export function SnapshotPanel() {
  const [showPanel, setShowPanel] = useState(true);

  const snapshots = useSimulationStore((state) => state.snapshots);
  const activeSnapshotId = useSimulationStore((state) => state.activeSnapshotId);
  const isReplaying = useSimulationStore((state) => state.isReplaying);
  const saveSnapshot = useSimulationStore((state) => state.saveSnapshot);
  const loadSnapshot = useSimulationStore((state) => state.loadSnapshot);
  const deleteSnapshot = useSimulationStore((state) => state.deleteSnapshot);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        className="fixed left-4 bottom-4 z-30 p-3 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 text-cyan-400 hover:text-white hover:bg-slate-800/90 transition-all shadow-2xl"
      >
        <Camera size={24} />
      </button>
    );
  }

  return (
    <div className="fixed left-4 bottom-4 z-30 w-80 max-h-[60vh] overflow-y-auto bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
      {isReplaying && (
        <div className="px-4 py-2 bg-cyan-500/20 border-b border-cyan-500/30 flex items-center gap-2">
          <Activity size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-xs font-medium text-cyan-300">回放模式</span>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white">快照管理</h3>
        </div>
        <button
          onClick={() => setShowPanel(false)}
          className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={() => saveSnapshot()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium text-sm hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Save size={16} />
          保存快照
        </button>
      </div>

      <div className="px-3 pb-3 space-y-2">
        {snapshots.length === 0 ? (
          <div className="py-8 text-center">
            <Clock size={32} className="mx-auto text-slate-600 mb-2" />
            <p className="text-xs text-slate-500">暂无快照</p>
            <p className="text-xs text-slate-600 mt-1">点击上方按钮保存当前状态</p>
          </div>
        ) : (
          snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className={`p-3 rounded-xl border transition-all ${
                activeSnapshotId === snapshot.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">{snapshot.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{snapshot.date}</p>
                </div>
                {activeSnapshotId === snapshot.id && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-medium">
                    活动
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-900/40 rounded-lg px-2 py-1.5">
                  <div className="text-[10px] text-slate-500">运行时间</div>
                  <div className="text-xs font-mono text-slate-300">
                    {formatTime(snapshot.simulationTime)}
                  </div>
                </div>
                <div className="bg-slate-900/40 rounded-lg px-2 py-1.5">
                  <div className="text-[10px] text-slate-500">处理量</div>
                  <div className="text-xs font-mono text-slate-300">
                    {snapshot.dailyTreatmentVolume.toFixed(1)} m³
                  </div>
                </div>
                <div className="bg-slate-900/40 rounded-lg px-2 py-1.5">
                  <div className="text-[10px] text-slate-500">进水流量</div>
                  <div className="text-xs font-mono text-cyan-400">
                    {snapshot.inflowRate.toFixed(0)} m³/h
                  </div>
                </div>
                <div className="bg-slate-900/40 rounded-lg px-2 py-1.5">
                  <div className="text-[10px] text-slate-500">曝气强度</div>
                  <div className="text-xs font-mono text-emerald-400">
                    {snapshot.aerationIntensity.toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadSnapshot(snapshot.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-xs font-medium transition-colors border border-slate-600/30 hover:border-cyan-500/30"
                >
                  <Play size={12} />
                  加载
                </button>
                <button
                  onClick={() => deleteSnapshot(snapshot.id)}
                  className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors border border-slate-600/30 hover:border-red-500/30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
