import { WaterQuality, DischargeStandard, TreatmentUnitType, AlertRecord, ParameterType } from '../types';
import { TREATMENT_EFFICIENCY, TREATMENT_UNIT_ORDER, SIMULATION_CONFIG, PARAMETER_INFO } from './constants';

export function calculateTreatedWater(
  inletQuality: WaterQuality,
  unitType: TreatmentUnitType,
  aerationIntensity: number,
  inflowRate: number = 100
): WaterQuality {
  const baseEfficiency = TREATMENT_EFFICIENCY[unitType];
  const aerationFactor = unitType === 'aerationTank' 
    ? 0.3 + (aerationIntensity / 100) * 0.7 
    : 1;
  
  const inflowFactor = Math.max(0.6, 1.4 - (inflowRate / 200) * 0.8);

  const codRemoval = baseEfficiency.cod * aerationFactor * inflowFactor;
  const ammoniaRemoval = baseEfficiency.ammoniaNitrogen * aerationFactor * inflowFactor;
  const phosphorusRemoval = baseEfficiency.totalPhosphorus * aerationFactor * inflowFactor;

  return {
    cod: Math.max(5, inletQuality.cod * (1 - codRemoval)),
    ammoniaNitrogen: Math.max(0.1, inletQuality.ammoniaNitrogen * (1 - ammoniaRemoval)),
    totalPhosphorus: Math.max(0.05, inletQuality.totalPhosphorus * (1 - phosphorusRemoval)),
    ph: inletQuality.ph + (Math.random() - 0.5) * 0.3,
  };
}

export function checkWaterQuality(
  quality: WaterQuality,
  standard: DischargeStandard,
  standardName?: string
): { isCompliant: boolean; violations: AlertRecord[] } {
  const violations: AlertRecord[] = [];
  const name = standardName || standard.name;

  const getParamInfo = (key: ParameterType) => {
    return PARAMETER_INFO.find(p => p.key === key)!;
  };

  if (quality.cod > standard.cod) {
    const info = getParamInfo('cod');
    violations.push({
      unit: 'disinfectionTank',
      unitName: '',
      parameter: 'cod',
      parameterName: info.name,
      value: quality.cod,
      limit: standard.cod,
      timestamp: Date.now(),
      standardName: name,
    });
  }

  if (quality.ammoniaNitrogen > standard.ammoniaNitrogen) {
    const info = getParamInfo('ammoniaNitrogen');
    violations.push({
      unit: 'disinfectionTank',
      unitName: '',
      parameter: 'ammoniaNitrogen',
      parameterName: info.name,
      value: quality.ammoniaNitrogen,
      limit: standard.ammoniaNitrogen,
      timestamp: Date.now(),
      standardName: name,
    });
  }

  if (quality.totalPhosphorus > standard.totalPhosphorus) {
    const info = getParamInfo('totalPhosphorus');
    violations.push({
      unit: 'disinfectionTank',
      unitName: '',
      parameter: 'totalPhosphorus',
      parameterName: info.name,
      value: quality.totalPhosphorus,
      limit: standard.totalPhosphorus,
      timestamp: Date.now(),
      standardName: name,
    });
  }

  if (quality.ph < standard.phMin || quality.ph > standard.phMax) {
    const info = getParamInfo('ph');
    violations.push({
      unit: 'disinfectionTank',
      unitName: '',
      parameter: 'ph',
      parameterName: info.name,
      value: quality.ph,
      limit: quality.ph < standard.phMin ? standard.phMin : standard.phMax,
      timestamp: Date.now(),
      standardName: name,
    });
  }

  return {
    isCompliant: violations.length === 0,
    violations,
  };
}

export function calculateTreatmentEfficiency(
  inletQuality: WaterQuality,
  outletQuality: WaterQuality
): { cod: number; ammoniaNitrogen: number; totalPhosphorus: number } {
  return {
    cod: ((inletQuality.cod - outletQuality.cod) / inletQuality.cod) * 100,
    ammoniaNitrogen: ((inletQuality.ammoniaNitrogen - outletQuality.ammoniaNitrogen) / inletQuality.ammoniaNitrogen) * 100,
    totalPhosphorus: ((inletQuality.totalPhosphorus - outletQuality.totalPhosphorus) / inletQuality.totalPhosphorus) * 100,
  };
}

export function calculateComplianceRate(
  samples: { quality: WaterQuality; standard: DischargeStandard }[]
): number {
  if (samples.length === 0) return 100;

  const compliantSamples = samples.filter(
    ({ quality, standard }) => checkWaterQuality(quality, standard).isCompliant
  );

  return (compliantSamples.length / samples.length) * 100;
}

export function getWaterColor(cod: number): string {
  const normalizedCod = Math.min(1, Math.max(0, (cod - 5) / 295));
  
  if (normalizedCod < 0.2) {
    return `rgb(46, ${196 + Math.round((0.2 - normalizedCod) * 5 * 30)}, 182)`;
  } else if (normalizedCod < 0.4) {
    const t = (normalizedCod - 0.2) / 0.2;
    return `rgb(${Math.round(46 + t * 60)}, ${Math.round(226 - t * 40)}, ${Math.round(182 - t * 80)})`;
  } else if (normalizedCod < 0.6) {
    const t = (normalizedCod - 0.4) / 0.2;
    return `rgb(${Math.round(106 + t * 30)}, ${Math.round(186 - t * 30)}, ${Math.round(102 - t * 40)})`;
  } else if (normalizedCod < 0.8) {
    const t = (normalizedCod - 0.6) / 0.2;
    return `rgb(${Math.round(136 + t * 40)}, ${Math.round(156 - t * 40)}, ${Math.round(62 - t * 30)})`;
  } else {
    const t = (normalizedCod - 0.8) / 0.2;
    return `rgb(${Math.round(176 + t * 50)}, ${Math.round(116 - t * 40)}, ${Math.round(32 - t * 10)})`;
  }
}

export function interpolateWaterQuality(
  from: WaterQuality,
  to: WaterQuality,
  progress: number
): WaterQuality {
  return {
    cod: from.cod + (to.cod - from.cod) * progress,
    ammoniaNitrogen: from.ammoniaNitrogen + (to.ammoniaNitrogen - from.ammoniaNitrogen) * progress,
    totalPhosphorus: from.totalPhosphorus + (to.totalPhosphorus - from.totalPhosphorus) * progress,
    ph: from.ph + (to.ph - from.ph) * progress,
  };
}

export function calculateWaterLevelChange(
  currentLevel: number,
  maxLevel: number,
  inflowRate: number
): number {
  const targetLevel = (inflowRate / SIMULATION_CONFIG.maxInflowRate) * maxLevel * 0.85;
  const diff = targetLevel - currentLevel;
  return currentLevel + diff * SIMULATION_CONFIG.waterLevelChangeRate;
}

export function getUnitOrder(): TreatmentUnitType[] {
  return [...TREATMENT_UNIT_ORDER];
}

export function getPreviousUnit(unitId: TreatmentUnitType): TreatmentUnitType | null {
  const index = TREATMENT_UNIT_ORDER.indexOf(unitId);
  return index > 0 ? TREATMENT_UNIT_ORDER[index - 1] : null;
}

export function getNextUnit(unitId: TreatmentUnitType): TreatmentUnitType | null {
  const index = TREATMENT_UNIT_ORDER.indexOf(unitId);
  return index < TREATMENT_UNIT_ORDER.length - 1 ? TREATMENT_UNIT_ORDER[index + 1] : null;
}

export function generateRandomInletQuality(baseInlet?: WaterQuality): WaterQuality {
  const base = baseInlet || { cod: 300, ammoniaNitrogen: 35, totalPhosphorus: 4, ph: 7.2 };
  const variation = 0.1;
  return {
    cod: base.cod * (1 - variation + Math.random() * variation * 2),
    ammoniaNitrogen: base.ammoniaNitrogen * (1 - variation + Math.random() * variation * 2),
    totalPhosphorus: base.totalPhosphorus * (1 - variation + Math.random() * variation * 2),
    ph: Math.max(6, Math.min(9, base.ph + (Math.random() - 0.5) * 0.4)),
  };
}

export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
