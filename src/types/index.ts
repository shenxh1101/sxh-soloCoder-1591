export type TreatmentUnitType =
  | 'grate'
  | 'sandTank'
  | 'primaryTank'
  | 'aerationTank'
  | 'secondaryTank'
  | 'disinfectionTank';

export interface WaterQuality {
  cod: number;
  ammoniaNitrogen: number;
  totalPhosphorus: number;
  ph: number;
}

export interface TreatmentUnit {
  id: TreatmentUnitType;
  name: string;
  description: string;
  workingPrinciple: string;
  processes: string[];
  waterLevel: number;
  maxWaterLevel: number;
  waterQuality: WaterQuality;
  isAlert: boolean;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  color: string;
}

export interface DischargeStandard {
  name: string;
  cod: number;
  ammoniaNitrogen: number;
  totalPhosphorus: number;
  phMin: number;
  phMax: number;
}

export interface AlertRecord {
  unit: TreatmentUnitType;
  unitName: string;
  parameter: ParameterType;
  parameterName: string;
  value: number;
  limit: number;
  timestamp: number;
  standardName: string;
}

export interface DailyReport {
  date: string;
  totalInflow: number;
  totalOutflow: number;
  inletQuality: WaterQuality;
  outletQuality: WaterQuality;
  complianceRate: number;
  treatmentEfficiency: {
    cod: number;
    ammoniaNitrogen: number;
    totalPhosphorus: number;
  };
  alertRecords: AlertRecord[];
  hourlyData: {
    hour: number;
    inflow: number;
    quality: WaterQuality;
  }[];
}

export interface WaterQualityHistory {
  timestamp: number;
  unitId: TreatmentUnitType;
  quality: WaterQuality;
}

export type ParameterType = 'cod' | 'ammoniaNitrogen' | 'totalPhosphorus' | 'ph';

export interface ParameterInfo {
  key: ParameterType;
  name: string;
  unit: string;
  color: string;
  description: string;
}

export type ScenarioPresetType = 'normal' | 'shockLoad' | 'lowAeration' | 'powerRecovery';

export interface ScenarioPreset {
  id: ScenarioPresetType;
  name: string;
  description: string;
  icon: string;
  inflowRate: number;
  aerationIntensity: number;
  inletQuality: WaterQuality;
  isRunning: boolean;
}

export interface SimulationSnapshot {
  id: string;
  name: string;
  timestamp: number;
  date: string;
  inflowRate: number;
  aerationIntensity: number;
  simulationTime: number;
  dailyTreatmentVolume: number;
  units: Record<TreatmentUnitType, TreatmentUnit>;
  standard: DischargeStandard;
  alertRecords: AlertRecord[];
  qualityHistory: WaterQualityHistory[];
  dailyReport: DailyReport | null;
}

export interface AlertFilter {
  unitId: TreatmentUnitType | 'all';
  parameter: ParameterType | 'all';
}

export interface AlertDisposalInfo {
  parameter: string;
  parameterName: string;
  unit: TreatmentUnitType;
  unitName: string;
  causes: string[];
  suggestions: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface HistoricalReport {
  date: string;
  totalInflow: number;
  totalOutflow: number;
  inletQuality: WaterQuality;
  outletQuality: WaterQuality;
  complianceRate: number;
  treatmentEfficiency: {
    cod: number;
    ammoniaNitrogen: number;
    totalPhosphorus: number;
  };
  alertCount: number;
}

export interface TrendAnalysis {
  direction: 'improving' | 'worsening' | 'stable';
  changeRate: number;
  consecutiveDays: number;
  summary: string;
  suggestion: string;
}

export interface TimelineKeyframe {
  id: string;
  timestamp: number;
  snapshotTime: number;
  inflowRate: number;
  aerationIntensity: number;
  dailyTreatmentVolume: number;
  units: Record<TreatmentUnitType, TreatmentUnit>;
  alertRecords: AlertRecord[];
  dailyReport: DailyReport | null;
  qualityHistory: WaterQualityHistory[];
}

export interface SnapshotTimeline {
  id: string;
  name: string;
  createdAt: number;
  keyframes: TimelineKeyframe[];
}

export interface SimulationState {
  inflowRate: number;
  aerationIntensity: number;
  isRunning: boolean;
  isTeachingMode: boolean;
  simulationTime: number;
  dailyTreatmentVolume: number;
  units: Record<TreatmentUnitType, TreatmentUnit>;
  standard: DischargeStandard;
  dailyReport: DailyReport | null;
  alertRecords: AlertRecord[];
  selectedUnit: TreatmentUnitType | null;
  showStandardConfig: boolean;
  showDailyReport: boolean;
  highlightedUnit: TreatmentUnitType | null;
  activeScenario: ScenarioPresetType | null;
  snapshots: SimulationSnapshot[];
  activeSnapshotId: string | null;
  isReplaying: boolean;
  alertFilter: AlertFilter;
  showAlertCenter: boolean;
  historicalReports: HistoricalReport[];
  reportTab: 'summary' | 'history';
  timelines: SnapshotTimeline[];
  activeTimelineId: string | null;
  currentKeyframeIndex: number;
  isTimelinePlaying: boolean;
  timelineSpeed: 1 | 2 | 4;
  selectedAlert: AlertRecord | null;
}
