import { create } from 'zustand';
import {
  SimulationState,
  TreatmentUnitType,
  DischargeStandard,
  WaterQuality,
  AlertRecord,
  WaterQualityHistory,
  DailyReport,
  ScenarioPresetType,
  SimulationSnapshot,
  AlertFilter,
  ParameterType,
  HistoricalReport,
  TimelineKeyframe,
  SnapshotTimeline,
} from '../types';
import {
  UNIT_CONFIGS,
  DEFAULT_STANDARD,
  INITIAL_INLET_QUALITY,
  SIMULATION_CONFIG,
  TREATMENT_UNIT_ORDER,
  SCENARIO_PRESETS,
  UNIT_NAMES,
  PARAMETER_INFO,
} from '../utils/constants';
import {
  calculateTreatedWater,
  checkWaterQuality,
  calculateWaterLevelChange,
  interpolateWaterQuality,
  generateRandomInletQuality,
  calculateTreatmentEfficiency,
} from '../utils/waterTreatment';
import { generateDailyReport } from '../utils/reportGenerator';

let currentInletQualityOverride: WaterQuality | null = null;
let playbackInterval: ReturnType<typeof setInterval> | null = null;

function createInitialUnits(inletQuality?: WaterQuality, aeration?: number, inflow?: number) {
  const units = {} as SimulationState['units'];
  let currentQuality: WaterQuality = { ...(inletQuality || INITIAL_INLET_QUALITY) };
  const aerationIntensity = aeration ?? SIMULATION_CONFIG.defaultAerationIntensity;
  const inflowRate = inflow ?? SIMULATION_CONFIG.defaultInflowRate;

  TREATMENT_UNIT_ORDER.forEach((unitId) => {
    const config = UNIT_CONFIGS[unitId];
    const treatedQuality = calculateTreatedWater(
      currentQuality,
      unitId,
      aerationIntensity,
      inflowRate
    );
    
    units[unitId] = {
      ...config,
      waterLevel: config.maxWaterLevel * 0.6,
      waterQuality: treatedQuality,
      isAlert: false,
    };
    
    currentQuality = treatedQuality;
  });

  return units;
}

function generateHistoricalReports(): HistoricalReport[] {
  const reports: HistoricalReport[] = [];
  const today = new Date();

  const complianceTrend = [78, 82, 80, 84, 81, 68];

  for (let i = 6; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('zh-CN');

    const dayIndex = 6 - i;
    const targetCompliance = complianceTrend[dayIndex];
    const efficiencyFactor = 0.78 + (targetCompliance - 70) / 200 + Math.random() * 0.05;

    const baseQuality = {
      cod: 280 + Math.random() * 60,
      ammoniaNitrogen: 32 + Math.random() * 10,
      totalPhosphorus: 3.5 + Math.random() * 1.5,
      ph: 7.0 + Math.random() * 0.4,
    };

    const outletQuality = {
      cod: baseQuality.cod * (1 - 0.75 * efficiencyFactor),
      ammoniaNitrogen: baseQuality.ammoniaNitrogen * (1 - 0.7 * efficiencyFactor),
      totalPhosphorus: baseQuality.totalPhosphorus * (1 - 0.6 * efficiencyFactor),
      ph: 7.0 + Math.random() * 0.3,
    };

    const eff = calculateTreatmentEfficiency(baseQuality, outletQuality);
    const complianceRate = targetCompliance + (Math.random() - 0.5) * 4;
    const clampedCompliance = Math.max(50, Math.min(99, complianceRate));

    reports.push({
      date: dateStr,
      totalInflow: 800 + Math.random() * 600,
      totalOutflow: 760 + Math.random() * 570,
      inletQuality: baseQuality,
      outletQuality,
      complianceRate: clampedCompliance,
      treatmentEfficiency: eff,
      alertCount: clampedCompliance < 80 ? Math.floor(10 + Math.random() * 20) : Math.floor(Math.random() * 8),
    });
  }

  return reports;
}

interface SimulationStore extends SimulationState {
  qualityHistory: WaterQualityHistory[];
  complianceSamples: { quality: WaterQuality; standard: DischargeStandard }[];
  
  setInflowRate: (rate: number) => void;
  setAerationIntensity: (intensity: number) => void;
  toggleRunning: () => void;
  toggleTeachingMode: () => void;
  selectUnit: (unitId: TreatmentUnitType | null) => void;
  setShowStandardConfig: (show: boolean) => void;
  setShowDailyReport: (show: boolean) => void;
  updateStandard: (standard: DischargeStandard) => void;
  simulationTick: () => void;
  generateReport: () => void;
  resetSimulation: () => void;
  applyScenario: (scenarioId: ScenarioPresetType) => void;
  setHighlightedUnit: (unitId: TreatmentUnitType | null) => void;
  setAlertFilter: (filter: Partial<AlertFilter>) => void;
  setShowAlertCenter: (show: boolean) => void;
  locateAlert: (alert: AlertRecord) => void;
  saveSnapshot: (name?: string) => void;
  loadSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => void;
  setActiveSnapshotId: (id: string | null) => void;
  setIsReplaying: (replaying: boolean) => void;
  setReportTab: (tab: 'summary' | 'history') => void;
  currentInletQuality: WaterQuality | null;
  setCurrentInletQualityOverride: (quality: WaterQuality | null) => void;
  showScenarioPanel: boolean;
  setShowScenarioPanel: (show: boolean) => void;
  createTimeline: (name?: string) => void;
  appendKeyframe: () => void;
  seekTimeline: (index: number) => void;
  toggleTimelinePlayback: () => void;
  stepTimeline: (direction: -1 | 1) => void;
  setTimelineSpeed: (speed: 1 | 2 | 4) => void;
  deleteTimeline: (id: string) => void;
  setActiveTimeline: (id: string) => void;
  setSelectedAlert: (alert: AlertRecord | null) => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  inflowRate: SIMULATION_CONFIG.defaultInflowRate,
  aerationIntensity: SIMULATION_CONFIG.defaultAerationIntensity,
  isRunning: false,
  isTeachingMode: false,
  simulationTime: 0,
  dailyTreatmentVolume: 0,
  units: createInitialUnits(),
  standard: DEFAULT_STANDARD,
  dailyReport: null,
  alertRecords: [],
  selectedUnit: null,
  showStandardConfig: false,
  showDailyReport: false,
  highlightedUnit: null,
  activeScenario: null,
  snapshots: [],
  activeSnapshotId: null,
  isReplaying: false,
  alertFilter: { unitId: 'all', parameter: 'all' },
  showAlertCenter: false,
  historicalReports: generateHistoricalReports(),
  reportTab: 'summary',
  qualityHistory: [],
  complianceSamples: [],
  currentInletQuality: null,
  showScenarioPanel: true,
  timelines: [],
  activeTimelineId: null,
  currentKeyframeIndex: -1,
  isTimelinePlaying: false,
  timelineSpeed: 1,
  selectedAlert: null,

  setInflowRate: (rate: number) => set({ inflowRate: rate }),

  setAerationIntensity: (intensity: number) => set({ aerationIntensity: intensity }),

  toggleRunning: () => set((state) => ({ isRunning: !state.isRunning })),

  toggleTeachingMode: () => set((state) => ({ isTeachingMode: !state.isTeachingMode })),

  selectUnit: (unitId: TreatmentUnitType | null) => set({ selectedUnit: unitId }),

  setShowStandardConfig: (show: boolean) => set({ showStandardConfig: show }),

  setShowDailyReport: (show: boolean) => set({ showDailyReport: show }),

  updateStandard: (standard: DischargeStandard) => set({ standard }),

  setHighlightedUnit: (unitId: TreatmentUnitType | null) => set({ highlightedUnit: unitId }),

  setAlertFilter: (filter: Partial<AlertFilter>) => 
    set((state) => ({ alertFilter: { ...state.alertFilter, ...filter } })),

  setShowAlertCenter: (show: boolean) => set({ showAlertCenter: show }),

  setSelectedAlert: (alert: AlertRecord | null) => set({ selectedAlert: alert }),

  locateAlert: (alert: AlertRecord) => {
    const unitMap: Record<string, TreatmentUnitType> = {
      '格栅': 'grate',
      '沉砂池': 'sandTank',
      '初沉池': 'primaryTank',
      '曝气池': 'aerationTank',
      '二沉池': 'secondaryTank',
      '消毒池': 'disinfectionTank',
    };
    const unitId = unitMap[alert.unit] || (alert.unit as TreatmentUnitType);
    set({ 
      highlightedUnit: unitId, 
      selectedUnit: unitId,
      selectedAlert: alert,
    });
    setTimeout(() => {
      set({ highlightedUnit: null });
    }, 5000);
  },

  applyScenario: (scenarioId: ScenarioPresetType) => {
    const scenario = SCENARIO_PRESETS.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    currentInletQualityOverride = scenario.inletQuality;
    const newUnits = createInitialUnits(
      scenario.inletQuality,
      scenario.aerationIntensity,
      scenario.inflowRate
    );

    const newAlertRecords: AlertRecord[] = [];
    TREATMENT_UNIT_ORDER.forEach((unitId, index) => {
      if (index === TREATMENT_UNIT_ORDER.length - 1) {
        const unit = newUnits[unitId];
        const check = checkWaterQuality(unit.waterQuality, DEFAULT_STANDARD, DEFAULT_STANDARD.name);
        if (!check.isCompliant) {
          check.violations.forEach(v => {
            newAlertRecords.push({ 
              ...v, 
              unit: unitId, 
              unitName: unit.name, 
              timestamp: Date.now() 
            });
          });
        }
      }
    });

    set({
      inflowRate: scenario.inflowRate,
      aerationIntensity: scenario.aerationIntensity,
      isRunning: scenario.isRunning,
      activeScenario: scenarioId,
      units: newUnits,
      alertRecords: newAlertRecords,
      simulationTime: 0,
      dailyTreatmentVolume: 0,
      qualityHistory: [],
      complianceSamples: [],
      dailyReport: null,
    });
  },

  saveSnapshot: (name?: string) => {
    const state = get();
    const timestamp = Date.now();
    const snapshot: SimulationSnapshot = {
      id: `snap_${timestamp}`,
      name: name || `快照_${new Date(timestamp).toLocaleString('zh-CN')}`,
      timestamp,
      date: new Date(timestamp).toLocaleDateString('zh-CN'),
      inflowRate: state.inflowRate,
      aerationIntensity: state.aerationIntensity,
      simulationTime: state.simulationTime,
      dailyTreatmentVolume: state.dailyTreatmentVolume,
      units: JSON.parse(JSON.stringify(state.units)),
      standard: { ...state.standard },
      alertRecords: [...state.alertRecords],
      qualityHistory: [...state.qualityHistory],
      dailyReport: state.dailyReport ? { ...state.dailyReport } : null,
    };
    
    set((state) => ({
      snapshots: [snapshot, ...state.snapshots].slice(0, 20),
    }));
  },

  loadSnapshot: (snapshotId: string) => {
    const state = get();
    const snapshot = state.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) return;

    const unitNameToIdMap: Record<string, TreatmentUnitType> = {};
    TREATMENT_UNIT_ORDER.forEach(id => {
      unitNameToIdMap[UNIT_NAMES[id]] = id;
    });
    const paramNameToKeyMap: Record<string, ParameterType> = {};
    PARAMETER_INFO.forEach(p => {
      paramNameToKeyMap[p.name] = p.key;
    });

    const normalizeAlertRecords = (records: AlertRecord[]): AlertRecord[] => {
      return records.map((rawAlert: any) => {
        const alert = { ...rawAlert };
        const hasOldUnitFormat = typeof alert.unit === 'string' && unitNameToIdMap[alert.unit] !== undefined;
        const hasOldParamFormat = typeof alert.parameter === 'string' && paramNameToKeyMap[alert.parameter] !== undefined;

        if (hasOldUnitFormat) {
          const unitName = alert.unit;
          alert.unit = unitNameToIdMap[unitName];
          alert.unitName = unitName;
        } else if (!alert.unitName) {
          alert.unitName = UNIT_NAMES[alert.unit] || alert.unit;
        }

        if (hasOldParamFormat) {
          const paramName = alert.parameter;
          alert.parameter = paramNameToKeyMap[paramName];
          alert.parameterName = paramName;
        } else if (!alert.parameterName) {
          const paramInfo = PARAMETER_INFO.find(p => p.key === alert.parameter);
          alert.parameterName = paramInfo ? paramInfo.name : alert.parameter;
        }

        return alert as AlertRecord;
      });
    };

    const normalizedAlertRecords = normalizeAlertRecords(snapshot.alertRecords);
    const normalizedDailyReport = snapshot.dailyReport
      ? {
          ...snapshot.dailyReport,
          alertRecords: normalizeAlertRecords(snapshot.dailyReport.alertRecords),
        }
      : null;

    set({
      inflowRate: snapshot.inflowRate,
      aerationIntensity: snapshot.aerationIntensity,
      simulationTime: snapshot.simulationTime,
      dailyTreatmentVolume: snapshot.dailyTreatmentVolume,
      units: JSON.parse(JSON.stringify(snapshot.units)),
      standard: { ...snapshot.standard },
      alertRecords: normalizedAlertRecords,
      qualityHistory: [...snapshot.qualityHistory],
      dailyReport: normalizedDailyReport,
      activeSnapshotId: snapshotId,
      isRunning: false,
      isReplaying: true,
    });
  },

  deleteSnapshot: (snapshotId: string) => {
    set((state) => ({
      snapshots: state.snapshots.filter(s => s.id !== snapshotId),
      activeSnapshotId: state.activeSnapshotId === snapshotId ? null : state.activeSnapshotId,
    }));
  },

  setActiveSnapshotId: (id: string | null) => set({ activeSnapshotId: id }),

  setIsReplaying: (replaying: boolean) => set({ isReplaying: replaying }),

  setReportTab: (tab: 'summary' | 'history') => set({ reportTab: tab }),

  setShowScenarioPanel: (show: boolean) => set({ showScenarioPanel: show }),

  setCurrentInletQualityOverride: (quality: WaterQuality | null) => {
    currentInletQualityOverride = quality;
  },

  simulationTick: () => {
    const state = get();
    if (!state.isRunning || state.isReplaying) return;

    const newUnits = { ...state.units };
    const newAlertRecords = [...state.alertRecords];
    const newQualityHistory = [...state.qualityHistory];
    const newComplianceSamples = [...state.complianceSamples];

    const baseInlet = currentInletQualityOverride || INITIAL_INLET_QUALITY;
    let inletQuality = generateRandomInletQuality(baseInlet);
    let hasAlert = false;

    TREATMENT_UNIT_ORDER.forEach((unitId, index) => {
      const unit = newUnits[unitId];
      const previousUnitId = index > 0 ? TREATMENT_UNIT_ORDER[index - 1] : null;
      
      const inletToUnit = previousUnitId 
        ? newUnits[previousUnitId].waterQuality 
        : inletQuality;

      const treatedQuality = calculateTreatedWater(
        inletToUnit,
        unitId,
        state.aerationIntensity,
        state.inflowRate
      );

      const newWaterLevel = calculateWaterLevelChange(
        unit.waterLevel,
        unit.maxWaterLevel,
        state.inflowRate
      );

      const qualityCheck = checkWaterQuality(treatedQuality, state.standard, state.standard.name);
      const unitHasAlert = !qualityCheck.isCompliant && index === TREATMENT_UNIT_ORDER.length - 1;

      if (unitHasAlert) {
        hasAlert = true;
        qualityCheck.violations.forEach(v => {
          newAlertRecords.push({
            ...v,
            unit: unitId,
            unitName: unit.name,
          });
        });
      }

      const interpolatedQuality = interpolateWaterQuality(
        unit.waterQuality,
        treatedQuality,
        SIMULATION_CONFIG.qualityUpdateRate
      );

      newUnits[unitId] = {
        ...unit,
        waterLevel: newWaterLevel,
        waterQuality: interpolatedQuality,
        isAlert: unitHasAlert,
      };

      newQualityHistory.push({
        timestamp: Date.now(),
        unitId,
        quality: interpolatedQuality,
      });
    });

    const lastUnit = newUnits[TREATMENT_UNIT_ORDER[TREATMENT_UNIT_ORDER.length - 1]];
    newComplianceSamples.push({
      quality: lastUnit.waterQuality,
      standard: state.standard,
    });

    if (newQualityHistory.length > 2000) {
      newQualityHistory.splice(0, newQualityHistory.length - 2000);
    }
    if (newComplianceSamples.length > 200) {
      newComplianceSamples.splice(0, newComplianceSamples.length - 200);
    }
    if (newAlertRecords.length > 200) {
      newAlertRecords.splice(0, newAlertRecords.length - 200);
    }

    set({
      units: newUnits,
      alertRecords: newAlertRecords,
      qualityHistory: newQualityHistory,
      complianceSamples: newComplianceSamples,
      simulationTime: state.simulationTime + SIMULATION_CONFIG.tickInterval,
      dailyTreatmentVolume: state.dailyTreatmentVolume + (state.inflowRate * SIMULATION_CONFIG.tickInterval) / 3600000,
    });
  },

  generateReport: () => {
    const state = get();
    const inletQuality = currentInletQualityOverride || INITIAL_INLET_QUALITY;
    const outletQuality = state.units.disinfectionTank.waterQuality;
    const reportDate = new Date().toLocaleDateString('zh-CN');

    const report = generateDailyReport(
      reportDate,
      state.dailyTreatmentVolume,
      state.dailyTreatmentVolume * 0.95,
      inletQuality,
      outletQuality,
      state.standard,
      state.alertRecords,
      state.qualityHistory
    );

    const histEff = calculateTreatmentEfficiency(inletQuality, outletQuality);
    const compliantSamples = state.complianceSamples.filter(s =>
      checkWaterQuality(s.quality, s.standard).isCompliant
    );
    const complianceRate = state.complianceSamples.length > 0
      ? (compliantSamples.length / state.complianceSamples.length) * 100
      : 100;

    const newHistoricalReport: HistoricalReport = {
      date: report.date,
      totalInflow: report.totalInflow,
      totalOutflow: report.totalOutflow,
      inletQuality: { ...report.inletQuality },
      outletQuality: { ...report.outletQuality },
      complianceRate,
      treatmentEfficiency: histEff,
      alertCount: report.alertRecords.length,
    };

    set((prevState) => {
      const deduped = prevState.historicalReports.filter(h => h.date !== reportDate);
      const withNew = [...deduped, newHistoricalReport];
      const sorted = withNew.sort((a, b) => {
        const dateA = new Date(a.date.replace(/\//g, '-'));
        const dateB = new Date(b.date.replace(/\//g, '-'));
        return dateA.getTime() - dateB.getTime();
      });
      const trimmed = sorted.slice(-7);

      return {
        dailyReport: report,
        showDailyReport: true,
        historicalReports: trimmed,
      };
    });
  },

  resetSimulation: () => {
    currentInletQualityOverride = null;
    if (playbackInterval) {
      clearInterval(playbackInterval);
      playbackInterval = null;
    }
    set({
      inflowRate: SIMULATION_CONFIG.defaultInflowRate,
      aerationIntensity: SIMULATION_CONFIG.defaultAerationIntensity,
      isRunning: false,
      simulationTime: 0,
      dailyTreatmentVolume: 0,
      units: createInitialUnits(),
      alertRecords: [],
      qualityHistory: [],
      complianceSamples: [],
      dailyReport: null,
      activeScenario: null,
      highlightedUnit: null,
      isReplaying: false,
      activeSnapshotId: null,
      activeTimelineId: null,
      currentKeyframeIndex: -1,
      isTimelinePlaying: false,
      selectedAlert: null,
    });
  },

  createTimeline: (name?: string) => {
    const state = get();
    const timestamp = Date.now();
    const timelineId = `timeline_${timestamp}`;
    const firstKeyframe: TimelineKeyframe = {
      id: `kf_${timestamp}`,
      timestamp,
      snapshotTime: state.simulationTime,
      inflowRate: state.inflowRate,
      aerationIntensity: state.aerationIntensity,
      dailyTreatmentVolume: state.dailyTreatmentVolume,
      units: JSON.parse(JSON.stringify(state.units)),
      alertRecords: [...state.alertRecords],
      dailyReport: state.dailyReport ? { ...state.dailyReport } : null,
      qualityHistory: [...state.qualityHistory],
    };
    const newTimeline: SnapshotTimeline = {
      id: timelineId,
      name: name || `时间轴_${new Date(timestamp).toLocaleString('zh-CN')}`,
      createdAt: timestamp,
      keyframes: [firstKeyframe],
    };
    if (playbackInterval) {
      clearInterval(playbackInterval);
      playbackInterval = null;
    }
    set((prev) => ({
      timelines: [newTimeline, ...prev.timelines],
      activeTimelineId: timelineId,
      currentKeyframeIndex: 0,
      isTimelinePlaying: false,
    }));
  },

  appendKeyframe: () => {
    const state = get();
    if (!state.activeTimelineId) return;
    const timeline = state.timelines.find((t) => t.id === state.activeTimelineId);
    if (!timeline) return;
    if (timeline.keyframes.length >= 20) return;

    const timestamp = Date.now();
    const lastKeyframe = timeline.keyframes[timeline.keyframes.length - 1];
    if (lastKeyframe && timestamp - lastKeyframe.timestamp < 5000) {
      const updatedKeyframe: TimelineKeyframe = {
        ...lastKeyframe,
        timestamp,
        snapshotTime: state.simulationTime,
        inflowRate: state.inflowRate,
        aerationIntensity: state.aerationIntensity,
        dailyTreatmentVolume: state.dailyTreatmentVolume,
        units: JSON.parse(JSON.stringify(state.units)),
        alertRecords: [...state.alertRecords],
        dailyReport: state.dailyReport ? { ...state.dailyReport } : null,
        qualityHistory: [...state.qualityHistory],
      };
      set((prev) => ({
        timelines: prev.timelines.map((t) =>
          t.id === state.activeTimelineId
            ? {
                ...t,
                keyframes: t.keyframes.map((kf, i) =>
                  i === t.keyframes.length - 1 ? updatedKeyframe : kf
                ),
              }
            : t
        ),
      }));
      return;
    }

    const newKeyframe: TimelineKeyframe = {
      id: `kf_${timestamp}`,
      timestamp,
      snapshotTime: state.simulationTime,
      inflowRate: state.inflowRate,
      aerationIntensity: state.aerationIntensity,
      dailyTreatmentVolume: state.dailyTreatmentVolume,
      units: JSON.parse(JSON.stringify(state.units)),
      alertRecords: [...state.alertRecords],
      dailyReport: state.dailyReport ? { ...state.dailyReport } : null,
      qualityHistory: [...state.qualityHistory],
    };
    set((prev) => ({
      timelines: prev.timelines.map((t) =>
        t.id === state.activeTimelineId
          ? { ...t, keyframes: [...t.keyframes, newKeyframe] }
          : t
      ),
      currentKeyframeIndex: timeline.keyframes.length,
    }));
  },

  seekTimeline: (index: number) => {
    const state = get();
    if (!state.activeTimelineId) return;
    const timeline = state.timelines.find((t) => t.id === state.activeTimelineId);
    if (!timeline) return;
    if (index < 0 || index >= timeline.keyframes.length) return;
    const kf = timeline.keyframes[index];
    set({
      units: JSON.parse(JSON.stringify(kf.units)),
      alertRecords: [...kf.alertRecords],
      inflowRate: kf.inflowRate,
      aerationIntensity: kf.aerationIntensity,
      dailyTreatmentVolume: kf.dailyTreatmentVolume,
      simulationTime: kf.snapshotTime,
      qualityHistory: [...kf.qualityHistory],
      dailyReport: kf.dailyReport ? { ...kf.dailyReport } : null,
      currentKeyframeIndex: index,
      isRunning: false,
      isReplaying: true,
      activeSnapshotId: null,
    });
  },

  toggleTimelinePlayback: () => {
    const state = get();
    if (!state.activeTimelineId) return;
    const timeline = state.timelines.find((t) => t.id === state.activeTimelineId);
    if (!timeline || timeline.keyframes.length === 0) return;

    if (state.isTimelinePlaying) {
      if (playbackInterval) {
        clearInterval(playbackInterval);
        playbackInterval = null;
      }
      set({ isTimelinePlaying: false });
    } else {
      set({ isTimelinePlaying: true });
      const intervalMs = 1000 / state.timelineSpeed;
      playbackInterval = setInterval(() => {
        const currentState = get();
        const currentTimeline = currentState.timelines.find(
          (t) => t.id === currentState.activeTimelineId
        );
        if (!currentTimeline) {
          if (playbackInterval) {
            clearInterval(playbackInterval);
            playbackInterval = null;
          }
          set({ isTimelinePlaying: false });
          return;
        }
        const nextIndex = currentState.currentKeyframeIndex + 1;
        if (nextIndex >= currentTimeline.keyframes.length) {
          if (playbackInterval) {
            clearInterval(playbackInterval);
            playbackInterval = null;
          }
          set({ isTimelinePlaying: false });
          return;
        }
        currentState.seekTimeline(nextIndex);
      }, intervalMs);
    }
  },

  stepTimeline: (direction: -1 | 1) => {
    const state = get();
    if (!state.activeTimelineId) return;
    const timeline = state.timelines.find((t) => t.id === state.activeTimelineId);
    if (!timeline) return;
    const targetIndex = state.currentKeyframeIndex + direction;
    if (targetIndex >= 0 && targetIndex < timeline.keyframes.length) {
      state.seekTimeline(targetIndex);
    }
  },

  setTimelineSpeed: (speed: 1 | 2 | 4) => {
    const state = get();
    set({ timelineSpeed: speed });
    if (state.isTimelinePlaying && playbackInterval) {
      clearInterval(playbackInterval);
      playbackInterval = null;
      const intervalMs = 1000 / speed;
      playbackInterval = setInterval(() => {
        const currentState = get();
        const currentTimeline = currentState.timelines.find(
          (t) => t.id === currentState.activeTimelineId
        );
        if (!currentTimeline) {
          if (playbackInterval) {
            clearInterval(playbackInterval);
            playbackInterval = null;
          }
          set({ isTimelinePlaying: false });
          return;
        }
        const nextIndex = currentState.currentKeyframeIndex + 1;
        if (nextIndex >= currentTimeline.keyframes.length) {
          if (playbackInterval) {
            clearInterval(playbackInterval);
            playbackInterval = null;
          }
          set({ isTimelinePlaying: false });
          return;
        }
        currentState.seekTimeline(nextIndex);
      }, intervalMs);
    }
  },

  deleteTimeline: (id: string) => {
    const state = get();
    if (state.activeTimelineId === id && playbackInterval) {
      clearInterval(playbackInterval);
      playbackInterval = null;
    }
    set((prev) => ({
      timelines: prev.timelines.filter((t) => t.id !== id),
      activeTimelineId: prev.activeTimelineId === id ? null : prev.activeTimelineId,
      currentKeyframeIndex: prev.activeTimelineId === id ? -1 : prev.currentKeyframeIndex,
      isTimelinePlaying: prev.activeTimelineId === id ? false : prev.isTimelinePlaying,
      isReplaying: prev.activeTimelineId === id ? false : prev.isReplaying,
    }));
  },

  setActiveTimeline: (id: string) => {
    const state = get();
    if (playbackInterval) {
      clearInterval(playbackInterval);
      playbackInterval = null;
    }
    const timeline = state.timelines.find((t) => t.id === id);
    if (!timeline) return;
    set({
      activeTimelineId: id,
      currentKeyframeIndex: 0,
      isTimelinePlaying: false,
    });
    if (timeline.keyframes.length > 0) {
      get().seekTimeline(0);
    }
  },
}));
