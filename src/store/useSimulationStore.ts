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
} from '../types';
import {
  UNIT_CONFIGS,
  DEFAULT_STANDARD,
  INITIAL_INLET_QUALITY,
  SIMULATION_CONFIG,
  TREATMENT_UNIT_ORDER,
  SCENARIO_PRESETS,
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
  
  for (let i = 6; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('zh-CN');
    
    const baseQuality = {
      cod: 280 + Math.random() * 60,
      ammoniaNitrogen: 32 + Math.random() * 10,
      totalPhosphorus: 3.5 + Math.random() * 1.5,
      ph: 7.0 + Math.random() * 0.4,
    };
    
    const efficiencyFactor = 0.85 + Math.random() * 0.15;
    const outletQuality = {
      cod: baseQuality.cod * (1 - 0.75 * efficiencyFactor),
      ammoniaNitrogen: baseQuality.ammoniaNitrogen * (1 - 0.7 * efficiencyFactor),
      totalPhosphorus: baseQuality.totalPhosphorus * (1 - 0.6 * efficiencyFactor),
      ph: 7.0 + Math.random() * 0.3,
    };
    
    const eff = calculateTreatmentEfficiency(baseQuality, outletQuality);
    const complianceRate = 70 + Math.random() * 30;
    
    reports.push({
      date: dateStr,
      totalInflow: 800 + Math.random() * 600,
      totalOutflow: 760 + Math.random() * 570,
      inletQuality: baseQuality,
      outletQuality,
      complianceRate,
      treatmentEfficiency: eff,
      alertCount: Math.floor(Math.random() * 30),
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

  locateAlert: (alert: AlertRecord) => {
    const unitMap: Record<string, TreatmentUnitType> = {
      '格栅': 'grate',
      '沉砂池': 'sandTank',
      '初沉池': 'primaryTank',
      '曝气池': 'aerationTank',
      '二沉池': 'secondaryTank',
      '消毒池': 'disinfectionTank',
    };
    const unitId = unitMap[alert.unit] || 'disinfectionTank';
    set({ 
      highlightedUnit: unitId, 
      selectedUnit: unitId,
      showAlertCenter: false,
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
            newAlertRecords.push({ ...v, unit: unit.name, timestamp: Date.now() });
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
    
    set({
      inflowRate: snapshot.inflowRate,
      aerationIntensity: snapshot.aerationIntensity,
      simulationTime: snapshot.simulationTime,
      dailyTreatmentVolume: snapshot.dailyTreatmentVolume,
      units: JSON.parse(JSON.stringify(snapshot.units)),
      standard: { ...snapshot.standard },
      alertRecords: [...snapshot.alertRecords],
      qualityHistory: [...snapshot.qualityHistory],
      dailyReport: snapshot.dailyReport ? { ...snapshot.dailyReport } : null,
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
            unit: unit.name,
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
    
    const report = generateDailyReport(
      new Date().toLocaleDateString('zh-CN'),
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
      const existingIndex = prevState.historicalReports.findIndex(h => h.date === report.date);
      const newHistorical = existingIndex >= 0
        ? prevState.historicalReports.map((h, i) => i === existingIndex ? newHistoricalReport : h)
        : [...prevState.historicalReports, newHistoricalReport].slice(-7);
      
      return {
        dailyReport: report,
        showDailyReport: true,
        historicalReports: newHistorical,
      };
    });
  },

  resetSimulation: () => {
    currentInletQualityOverride = null;
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
    });
  },
}));
