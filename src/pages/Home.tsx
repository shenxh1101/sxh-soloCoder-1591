import { useEffect } from 'react';
import { TreatmentPlant } from '../components/Scene/TreatmentPlant';
import { ParameterControls } from '../components/ControlPanel/ParameterControls';
import { StandardConfig } from '../components/ControlPanel/StandardConfig';
import { TeachingMode } from '../components/ControlPanel/TeachingMode';
import { WaterQualityPanel } from '../components/WaterQualityPanel/WaterQualityPanel';
import { DailyReportModal } from '../components/Report/DailyReportModal';
import { AlertToast } from '../components/UI/AlertToast';
import { useSimulationStore } from '../store/useSimulationStore';
import { useSimulationLoop } from '../hooks/useSimulationLoop';

export default function Home() {
  const showStandardConfig = useSimulationStore((state) => state.showStandardConfig);
  const showDailyReport = useSimulationStore((state) => state.showDailyReport);
  const selectedUnit = useSimulationStore((state) => state.selectedUnit);
  const isTeachingMode = useSimulationStore((state) => state.isTeachingMode);
  
  const setShowStandardConfig = useSimulationStore((state) => state.setShowStandardConfig);
  const setShowDailyReport = useSimulationStore((state) => state.setShowDailyReport);
  const selectUnit = useSimulationStore((state) => state.selectUnit);
  const generateReport = useSimulationStore((state) => state.generateReport);

  useEffect(() => {
    (window as any).simulationStore = useSimulationStore;
  }, []);

  useSimulationLoop();

  return (
    <div className="w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 text-center">
        <h1 
          className="text-3xl font-bold text-white tracking-wider"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          3D 污水处理厂工艺流程模拟系统
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          实时监测 · 参数控制 · 教学演示
        </p>
      </div>

      <div className="w-full h-full">
        <TreatmentPlant />
      </div>

      <ParameterControls
        onOpenStandard={() => setShowStandardConfig(true)}
        onGenerateReport={generateReport}
      />

      <WaterQualityPanel />

      <AlertToast />

      {isTeachingMode && (
        <TeachingMode
          unitId={selectedUnit}
          onClose={() => selectUnit(null)}
        />
      )}

      <StandardConfig
        isOpen={showStandardConfig}
        onClose={() => setShowStandardConfig(false)}
      />

      <DailyReportModal
        isOpen={showDailyReport}
        onClose={() => setShowDailyReport(false)}
      />

      <div className="absolute bottom-4 right-4 z-20 text-slate-500 text-xs">
        <p>鼠标左键: 旋转视角 | 滚轮: 缩放 | 右键: 平移</p>
      </div>
    </div>
  );
}
