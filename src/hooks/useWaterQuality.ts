import { useMemo } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { TreatmentUnitType, ParameterType } from '../types';
import { PARAMETER_INFO, TREATMENT_UNIT_ORDER } from '../utils/constants';
import { checkWaterQuality, calculateTreatmentEfficiency } from '../utils/waterTreatment';

export function useWaterQuality(unitId?: TreatmentUnitType) {
  const units = useSimulationStore((state) => state.units);
  const standard = useSimulationStore((state) => state.standard);
  const qualityHistory = useSimulationStore((state) => state.qualityHistory);

  const currentQuality = useMemo(() => {
    if (!unitId) return null;
    return units[unitId].waterQuality;
  }, [unitId, units]);

  const isAlert = useMemo(() => {
    if (!currentQuality) return false;
    return !checkWaterQuality(currentQuality, standard).isCompliant;
  }, [currentQuality, standard]);

  const violations = useMemo(() => {
    if (!currentQuality) return [];
    return checkWaterQuality(currentQuality, standard).violations;
  }, [currentQuality, standard]);

  const treatmentEfficiency = useMemo(() => {
    const inletQuality = units[TREATMENT_UNIT_ORDER[0]].waterQuality;
    if (!unitId) return null;
    
    const unitIndex = TREATMENT_UNIT_ORDER.indexOf(unitId);
    if (unitIndex === 0) return { cod: 0, ammoniaNitrogen: 0, totalPhosphorus: 0 };
    
    const previousUnitId = TREATMENT_UNIT_ORDER[unitIndex - 1];
    const previousQuality = units[previousUnitId].waterQuality;
    const currentQuality = units[unitId].waterQuality;
    
    return calculateTreatmentEfficiency(previousQuality, currentQuality);
  }, [unitId, units]);

  const overallEfficiency = useMemo(() => {
    const inletQuality = units[TREATMENT_UNIT_ORDER[0]].waterQuality;
    const outletQuality = units[TREATMENT_UNIT_ORDER[TREATMENT_UNIT_ORDER.length - 1]].waterQuality;
    return calculateTreatmentEfficiency(inletQuality, outletQuality);
  }, [units]);

  const parameterStatus = useMemo(() => {
    if (!currentQuality) return {};
    
    const status: Record<ParameterType, { value: number; isOk: boolean; limit: number }> = {
      cod: { value: currentQuality.cod, isOk: currentQuality.cod <= standard.cod, limit: standard.cod },
      ammoniaNitrogen: { 
        value: currentQuality.ammoniaNitrogen, 
        isOk: currentQuality.ammoniaNitrogen <= standard.ammoniaNitrogen, 
        limit: standard.ammoniaNitrogen 
      },
      totalPhosphorus: { 
        value: currentQuality.totalPhosphorus, 
        isOk: currentQuality.totalPhosphorus <= standard.totalPhosphorus, 
        limit: standard.totalPhosphorus 
      },
      ph: { 
        value: currentQuality.ph, 
        isOk: currentQuality.ph >= standard.phMin && currentQuality.ph <= standard.phMax, 
        limit: standard.phMax 
      },
    };
    
    return status;
  }, [currentQuality, standard]);

  const historyForUnit = useMemo(() => {
    if (!unitId) return [];
    return qualityHistory.filter(h => h.unitId === unitId).slice(-50);
  }, [unitId, qualityHistory]);

  const inletQuality = useMemo(() => {
    if (!unitId) return null;
    const unitIndex = TREATMENT_UNIT_ORDER.indexOf(unitId);
    if (unitIndex === 0) return units[TREATMENT_UNIT_ORDER[0]].waterQuality;
    const previousUnitId = TREATMENT_UNIT_ORDER[unitIndex - 1];
    return units[previousUnitId].waterQuality;
  }, [unitId, units]);

  const outletQuality = useMemo(() => {
    if (!unitId) return null;
    return units[unitId].waterQuality;
  }, [unitId, units]);

  return {
    currentQuality,
    isAlert,
    violations,
    treatmentEfficiency,
    overallEfficiency,
    parameterStatus,
    historyForUnit,
    parameterInfo: PARAMETER_INFO,
    inletQuality,
    outletQuality,
  };
}
