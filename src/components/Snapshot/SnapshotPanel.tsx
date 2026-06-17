import { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Play,
  Pause,
  Trash2,
  X,
  Save,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight,
  FastForward,
  Clapperboard,
  GripHorizontal,
  Plus,
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import type { TimelineKeyframe } from '../../types';

type PanelMode = 'snapshot' | 'timeline';

export function SnapshotPanel() {
  const [showPanel, setShowPanel] = useState(true);
  const [mode, setMode] = useState<PanelMode>('snapshot');
  const [tooltipFrame, setTooltipFrame] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const snapshots = useSimulationStore((state) => state.snapshots);
  const activeSnapshotId = useSimulationStore((state) => state.activeSnapshotId);
  const isReplaying = useSimulationStore((state) => state.isReplaying);
  const saveSnapshot = useSimulationStore((state) => state.saveSnapshot);
  const loadSnapshot = useSimulationStore((state) => state.loadSnapshot);
  const deleteSnapshot = useSimulationStore((state) => state.deleteSnapshot);

  const timelines = useSimulationStore((state) => state.timelines);
  const activeTimelineId = useSimulationStore((state) => state.activeTimelineId);
  const currentKeyframeIndex = useSimulationStore((state) => state.currentKeyframeIndex);
  const isTimelinePlaying = useSimulationStore((state) => state.isTimelinePlaying);
  const timelineSpeed = useSimulationStore((state) => state.timelineSpeed);
  const createTimeline = useSimulationStore((state) => state.createTimeline);
  const appendKeyframe = useSimulationStore((state) => state.appendKeyframe);
  const seekTimeline = useSimulationStore((state) => state.seekTimeline);
  const toggleTimelinePlayback = useSimulationStore((state) => state.toggleTimelinePlayback);
  const stepTimeline = useSimulationStore((state) => state.stepTimeline);
  const setTimelineSpeed = useSimulationStore((state) => state.setTimelineSpeed);
  const deleteTimeline = useSimulationStore((state) => state.deleteTimeline);
  const setActiveTimeline = useSimulationStore((state) => state.setActiveTimeline);

  const activeTimeline = timelines.find((t) => t.id === activeTimelineId) || null;

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatWallClock = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTimeline || activeTimeline.keyframes.length === 0) return;
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.round(ratio * (activeTimeline.keyframes.length - 1));
    seekTimeline(index);
  };

  const handleSliderDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleSliderClick(e);
  };

  useEffect(() => {
    const handleMouseUp = () => setTooltipFrame(null);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

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

  const renderReplayBanner = () => {
    if (!isReplaying) return null;
    const isTimelineMode = activeTimelineId !== null && mode === 'timeline';
    if (isTimelineMode && activeTimeline) {
      const total = activeTimeline.keyframes.length;
      const current = currentKeyframeIndex + 1;
      return (
        <div className="px-4 py-2 bg-purple-500/20 border-b border-purple-500/30">
          <div className="flex items-center gap-2 mb-1.5">
            <Activity size={14} className="text-purple-400 animate-pulse" />
            <span className="text-xs font-bold text-purple-300">时间轴回放模式</span>
            <span className="ml-auto text-xs font-mono text-purple-300">
              {current} / {total} 帧
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-300 animate-pulse"
              style={{ width: `${total > 0 ? (current / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="px-4 py-2 bg-cyan-500/20 border-b border-cyan-500/30 flex items-center gap-2">
        <Activity size={14} className="text-cyan-400 animate-pulse" />
        <span className="text-xs font-medium text-cyan-300">快照回放模式</span>
      </div>
    );
  };

  const renderTabBar = () => (
    <div className="px-3 pt-3 pb-0">
      <div className="flex bg-slate-800/50 rounded-xl p-1">
        <button
          onClick={() => setMode('snapshot')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            mode === 'snapshot'
              ? 'bg-slate-700/70 text-white shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera size={14} />
          快速快照
        </button>
        <button
          onClick={() => setMode('timeline')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            mode === 'timeline'
              ? 'bg-slate-700/70 text-white shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clapperboard size={14} />
          时间轴
        </button>
      </div>
    </div>
  );

  const renderSnapshotMode = () => (
    <>
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
    </>
  );

  const renderKeyframeCard = (kf: TimelineKeyframe, index: number) => {
    const isActive = index === currentKeyframeIndex;
    return (
      <div
        key={kf.id}
        onClick={() => seekTimeline(index)}
        className={`p-3 rounded-xl border cursor-pointer transition-all ${
          isActive
            ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
            : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50 hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${
                isActive
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700/70 text-slate-300'
              }`}
            >
              {index + 1}
            </span>
            <div>
              <div className="text-xs font-medium text-white">帧 {index + 1}</div>
              <div className="text-[10px] text-slate-500">{formatWallClock(kf.timestamp)}</div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            仿真 {formatTime(kf.snapshotTime)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-slate-900/40 rounded-lg px-2 py-1.5 text-center">
            <div className="text-[9px] text-slate-500">流量</div>
            <div className="text-xs font-mono text-cyan-400">
              {kf.inflowRate.toFixed(0)}
            </div>
          </div>
          <div className="bg-slate-900/40 rounded-lg px-2 py-1.5 text-center">
            <div className="text-[9px] text-slate-500">曝气</div>
            <div className="text-xs font-mono text-emerald-400">
              {kf.aerationIntensity.toFixed(0)}%
            </div>
          </div>
          <div className="bg-slate-900/40 rounded-lg px-2 py-1.5 text-center">
            <div className="text-[9px] text-slate-500">报警</div>
            <div
              className={`text-xs font-mono ${
                kf.alertRecords.length > 0 ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              {kf.alertRecords.length}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimelineMode = () => {
    const frames = activeTimeline?.keyframes || [];

    return (
      <div className="px-3 pb-3 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => createTimeline()}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-medium text-xs hover:from-purple-400 hover:to-fuchsia-400 transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus size={14} />
            创建时间轴
          </button>
          {activeTimeline && (
            <button
              onClick={() => appendKeyframe()}
              disabled={frames.length >= 20}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-600/60 text-white font-medium text-xs transition-all border border-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GripHorizontal size={14} />
              追加帧
            </button>
          )}
        </div>

        {timelines.length > 0 && (
          <div>
            <div className="text-[10px] text-slate-500 mb-1.5 px-1">选择时间轴</div>
            <div className="flex gap-2">
              <select
                value={activeTimelineId || ''}
                onChange={(e) => e.target.value && setActiveTimeline(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/50 text-xs text-white focus:outline-none focus:border-purple-500/50"
              >
                {timelines.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.keyframes.length}帧)
                  </option>
                ))}
              </select>
              {activeTimeline && (
                <button
                  onClick={() => deleteTimeline(activeTimeline.id)}
                  className="p-2 rounded-xl bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors border border-slate-600/30 hover:border-red-500/30"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {frames.length > 0 && activeTimeline && (
          <>
            <div>
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-[10px] text-slate-500">关键帧滑块</span>
                <span className="text-[10px] font-mono text-purple-400">
                  {currentKeyframeIndex + 1} / {frames.length}
                </span>
              </div>
              <div
                ref={sliderRef}
                onClick={handleSliderClick}
                onMouseMove={handleSliderDrag}
                className="relative h-12 rounded-xl bg-slate-800/60 border border-slate-700/50 cursor-pointer overflow-hidden select-none"
              >
                <div className="absolute top-0 left-0 right-0 h-1/2" />
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-700/80 transform -translate-y-1/2 rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all"
                    style={{
                      width: `${
                        frames.length > 1
                          ? (currentKeyframeIndex / (frames.length - 1)) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                {frames.map((_, i) => {
                  const position =
                    frames.length > 1 ? (i / (frames.length - 1)) * 100 : 50;
                  const isActive = i === currentKeyframeIndex;
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                      style={{ left: `calc(${position}% )` }}
                      onMouseEnter={() => setTooltipFrame(i)}
                      onMouseLeave={() => setTooltipFrame(null)}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                          isActive
                            ? 'bg-purple-500 border-white shadow-lg shadow-purple-500/50 scale-125'
                            : 'bg-slate-800 border-slate-500 hover:border-purple-400 hover:scale-110'
                        }`}
                      />
                      {tooltipFrame === i && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-slate-600 rounded-lg text-[10px] text-white whitespace-nowrap z-10 shadow-xl">
                          帧 {i + 1}
                          <div className="text-slate-400">
                            {formatWallClock(frames[i].timestamp)}
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-slate-900 border-r border-b border-slate-600 transform rotate-45" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <button
                onClick={() => stepTimeline(-1)}
                disabled={currentKeyframeIndex <= 0}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-white text-sm font-medium transition-all border border-slate-600/40 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => toggleTimelinePlayback()}
                disabled={frames.length < 2}
                className={`flex-[1.5] flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-white text-sm font-bold transition-all shadow-lg ${
                  isTimelinePlaying
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 shadow-purple-500/20'
                } disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {isTimelinePlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                {isTimelinePlaying ? '暂停' : '播放'}
              </button>

              <button
                onClick={() => stepTimeline(1)}
                disabled={currentKeyframeIndex >= frames.length - 1}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-white text-sm font-medium transition-all border border-slate-600/40 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>

              <div className="w-px h-10 bg-slate-700/60 mx-1" />

              <div className="flex flex-col items-center gap-1">
                <div className="text-[9px] text-slate-500 flex items-center gap-0.5">
                  <FastForward size={10} />
                  速度
                </div>
                <div className="flex bg-slate-900/60 rounded-lg p-0.5">
                  {([1, 2, 4] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setTimelineSpeed(s)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                        timelineSpeed === s
                          ? 'bg-purple-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      x{s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[10px] text-slate-500">关键帧列表</span>
                <span className="text-[10px] text-slate-600">
                  最多 20 帧，间隔 &lt;5 秒自动合并
                </span>
              </div>
              <div className="space-y-2 max-h-[28vh] overflow-y-auto pr-1">
                {frames.map((kf, i) => renderKeyframeCard(kf, i))}
              </div>
            </div>
          </>
        )}

        {frames.length === 0 && (
          <div className="py-10 text-center">
            <Clapperboard size={36} className="mx-auto text-slate-600 mb-3" />
            <p className="text-xs text-slate-500 mb-1">暂无时间轴</p>
            <p className="text-xs text-slate-600">
              点击上方「创建时间轴」按钮开始记录
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed left-4 bottom-4 z-30 w-80 max-h-[80vh] overflow-y-auto bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
      {renderReplayBanner()}

      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          {mode === 'snapshot' ? (
            <Camera size={18} className="text-cyan-400" />
          ) : (
            <Clapperboard size={18} className="text-purple-400" />
          )}
          <h3 className="text-sm font-bold text-white">
            {mode === 'snapshot' ? '快照管理' : '时间轴回放'}
          </h3>
        </div>
        <button
          onClick={() => setShowPanel(false)}
          className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {renderTabBar()}

      {mode === 'snapshot' ? renderSnapshotMode() : renderTimelineMode()}
    </div>
  );
}
