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
  unit: string;
  parameter: string;
  value: number;
  limit: number;
  timestamp: number;
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
