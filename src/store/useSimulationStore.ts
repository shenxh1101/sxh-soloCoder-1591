import { create } from 'zustand';
import {
  SimulationState,
  TreatmentUnitType,
  DischargeStandard,
  WaterQuality,
  AlertRecord,
  WaterQualityHistory,
  DailyReport,
} from '../types';
import {
  UNIT_CONFIGS,
  DEFAULT_STANDARD,
  INITIAL_INLET_QUALITY,
  SIMULATION_CONFIG,
  TREATMENT_UNIT_ORDER,
} from '../utils/constants';
import {
  calculateTreatedWater,
  checkWaterQuality,
  calculateWaterLevelChange,
  interpolateWaterQuality,
  generateRandomInletQuality,
} from '../utils/waterTreatment';
import { generateDailyReport } from '../utils/reportGenerator';

function createInitialUnits() {
  const units = {} as SimulationState['units'];
  let currentQuality: WaterQuality = { ...INITIAL_INLET_QUALITY };

  TREATMENT_UNIT_ORDER.forEach((unitId) => {
    const config = UNIT_CONFIGS[unitId];
    const treatedQuality = calculateTreatedWater(
      currentQuality,
      unitId,
      SIMULATION_CONFIG.defaultAerationIntensity
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
  qualityHistory: [],
  complianceSamples: [],

  setInflowRate: (rate: number) => set({ inflowRate: rate }),

  setAerationIntensity: (intensity: number) => set({ aerationIntensity: intensity }),

  toggleRunning: () => set((state) => ({ isRunning: !state.isRunning })),

  toggleTeachingMode: () => set((state) => ({ isTeachingMode: !state.isTeachingMode })),

  selectUnit: (unitId: TreatmentUnitType | null) => set({ selectedUnit: unitId }),

  setShowStandardConfig: (show: boolean) => set({ showStandardConfig: show }),

  setShowDailyReport: (show: boolean) => set({ showDailyReport: show }),

  updateStandard: (standard: DischargeStandard) => set({ standard }),

  simulationTick: () => {
    const state = get();
    if (!state.isRunning) return;

    const newUnits = { ...state.units };
    const newAlertRecords = [...state.alertRecords];
    const newQualityHistory = [...state.qualityHistory];
    const newComplianceSamples = [...state.complianceSamples];

    let inletQuality = generateRandomInletQuality();
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
        state.aerationIntensity
      );

      const newWaterLevel = calculateWaterLevelChange(
        unit.waterLevel,
        unit.maxWaterLevel,
        state.inflowRate
      );

      const qualityCheck = checkWaterQuality(treatedQuality, state.standard);
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

    if (newQualityHistory.length > 1000) {
      newQualityHistory.splice(0, newQualityHistory.length - 1000);
    }
    if (newComplianceSamples.length > 100) {
      newComplianceSamples.splice(0, newComplianceSamples.length - 100);
    }
    if (newAlertRecords.length > 100) {
      newAlertRecords.splice(0, newAlertRecords.length - 100);
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
    const inletQuality = INITIAL_INLET_QUALITY;
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

    set({ dailyReport: report, showDailyReport: true });
  },

  resetSimulation: () => {
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
    });
  },
}));
