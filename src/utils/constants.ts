import { TreatmentUnitType, DischargeStandard, ParameterInfo, TreatmentUnit, ScenarioPreset } from '../types';

export const TREATMENT_UNIT_ORDER: TreatmentUnitType[] = [
  'grate',
  'sandTank',
  'primaryTank',
  'aerationTank',
  'secondaryTank',
  'disinfectionTank',
];

export const UNIT_NAMES: Record<TreatmentUnitType, string> = {
  grate: '格栅',
  sandTank: '沉砂池',
  primaryTank: '初沉池',
  aerationTank: '曝气池',
  secondaryTank: '二沉池',
  disinfectionTank: '消毒池',
};

export const PARAMETER_INFO: ParameterInfo[] = [
  {
    key: 'cod',
    name: 'COD',
    unit: 'mg/L',
    color: '#ff6b6b',
    description: '化学需氧量，反映水中有机物污染程度',
  },
  {
    key: 'ammoniaNitrogen',
    name: '氨氮',
    unit: 'mg/L',
    color: '#4ecdc4',
    description: '水中以游离氨和铵离子形式存在的氮',
  },
  {
    key: 'totalPhosphorus',
    name: '总磷',
    unit: 'mg/L',
    color: '#ffe66d',
    description: '水体中所有形态磷的总和',
  },
  {
    key: 'ph',
    name: 'pH',
    unit: '',
    color: '#95e1d3',
    description: '水体酸碱度指标',
  },
];

export const DEFAULT_STANDARD: DischargeStandard = {
  name: '一级A排放标准',
  cod: 50,
  ammoniaNitrogen: 5,
  totalPhosphorus: 0.5,
  phMin: 6,
  phMax: 9,
};

export const ALTERNATIVE_STANDARDS: DischargeStandard[] = [
  {
    name: '一级B排放标准',
    cod: 60,
    ammoniaNitrogen: 8,
    totalPhosphorus: 1,
    phMin: 6,
    phMax: 9,
  },
  {
    name: '二级排放标准',
    cod: 100,
    ammoniaNitrogen: 25,
    totalPhosphorus: 3,
    phMin: 6,
    phMax: 9,
  },
];

export const INITIAL_INLET_QUALITY = {
  cod: 300,
  ammoniaNitrogen: 35,
  totalPhosphorus: 4,
  ph: 7.2,
};

export const TREATMENT_EFFICIENCY = {
  grate: { cod: 0.05, ammoniaNitrogen: 0.02, totalPhosphorus: 0.01 },
  sandTank: { cod: 0.1, ammoniaNitrogen: 0.05, totalPhosphorus: 0.03 },
  primaryTank: { cod: 0.3, ammoniaNitrogen: 0.15, totalPhosphorus: 0.2 },
  aerationTank: { cod: 0.6, ammoniaNitrogen: 0.7, totalPhosphorus: 0.4 },
  secondaryTank: { cod: 0.15, ammoniaNitrogen: 0.1, totalPhosphorus: 0.15 },
  disinfectionTank: { cod: 0.05, ammoniaNitrogen: 0.03, totalPhosphorus: 0.02 },
};

export const UNIT_CONFIGS: Record<TreatmentUnitType, Omit<TreatmentUnit, 'waterQuality' | 'waterLevel' | 'isAlert'>> = {
  grate: {
    id: 'grate',
    name: '格栅',
    description: '去除污水中较大的漂浮物和悬浮物',
    workingPrinciple: '格栅由一组平行的金属栅条制成，倾斜安装在污水渠道上。污水通过时，大于栅条间隙的悬浮物被截留，定期通过机械清渣或人工清渣方式清除栅渣。',
    processes: ['污水流入', '栅条过滤', '截留悬浮物', '栅渣清除', '污水流出'],
    maxWaterLevel: 3,
    position: { x: -12, y: 0, z: 0 },
    size: { width: 3, height: 4, depth: 2 },
    color: '#3e92cc',
  },
  sandTank: {
    id: 'sandTank',
    name: '沉砂池',
    description: '去除污水中比重较大的无机颗粒，如砂、砾石等',
    workingPrinciple: '利用重力沉降原理，控制污水流速使比重较大的无机颗粒沉降，而有机悬浮颗粒随水流带走。通常采用曝气沉砂池，通过曝气使污水旋流，砂粒在离心力作用下分离。',
    processes: ['进水配水', '旋流曝气', '砂粒沉降', '砂水分离', '排砂', '出水'],
    maxWaterLevel: 3.5,
    position: { x: -7, y: 0, z: 0 },
    size: { width: 4, height: 4.5, depth: 3 },
    color: '#2ec4b6',
  },
  primaryTank: {
    id: 'primaryTank',
    name: '初沉池',
    description: '去除污水中可沉降的悬浮固体，减轻后续处理负荷',
    workingPrinciple: '污水缓慢流过沉淀池，水中的悬浮固体在重力作用下沉降到池底。池底的刮泥机将污泥收集到污泥斗，定期排出。表面的浮渣通过撇渣装置清除。',
    processes: ['进水整流', '重力沉降', '污泥收集', '浮渣撇除', '上清液排出'],
    maxWaterLevel: 4,
    position: { x: -1, y: 0, z: 0 },
    size: { width: 5, height: 5, depth: 4 },
    color: '#8338ec',
  },
  aerationTank: {
    id: 'aerationTank',
    name: '曝气池',
    description: '利用活性污泥微生物降解水中的有机污染物',
    workingPrinciple: '将沉淀池出水与回流活性污泥混合，通过曝气设备充入空气。微生物在有氧条件下吸附、氧化分解水中的有机物，完成生物处理过程。曝气强度直接影响处理效果。',
    processes: ['进水混合', '曝气充氧', '微生物吸附', '有机物降解', '泥水混合液排出'],
    maxWaterLevel: 5,
    position: { x: 6, y: 0, z: 0 },
    size: { width: 8, height: 6, depth: 5 },
    color: '#fb5607',
  },
  secondaryTank: {
    id: 'secondaryTank',
    name: '二沉池',
    description: '实现泥水分离，澄清处理水并回流活性污泥',
    workingPrinciple: '曝气池的混合液进入二沉池，活性污泥在重力作用下沉降。澄清后的上层水作为出水排放，沉降的污泥一部分回流到曝气池维持微生物浓度，剩余污泥排出处理。',
    processes: ['进水布水', '污泥沉降', '上清液溢流', '污泥回流', '剩余污泥排放'],
    maxWaterLevel: 4.5,
    position: { x: 13, y: 0, z: 0 },
    size: { width: 5, height: 5.5, depth: 4 },
    color: '#3a86ff',
  },
  disinfectionTank: {
    id: 'disinfectionTank',
    name: '消毒池',
    description: '杀灭处理后水中的病原微生物，达标排放',
    workingPrinciple: '通过投加消毒剂（如次氯酸钠、紫外线照射等）杀灭水中的细菌、病毒等病原微生物。消毒过程需要保证足够的接触时间，确保消毒效果。',
    processes: ['投加消毒剂', '混合反应', '接触消毒', '余氯控制', '达标排放'],
    maxWaterLevel: 3,
    position: { x: 18, y: 0, z: 0 },
    size: { width: 4, height: 4, depth: 3 },
    color: '#06d6a0',
  },
};

export const SIMULATION_CONFIG = {
  tickInterval: 100,
  waterLevelChangeRate: 0.08,
  qualityUpdateRate: 0.3,
  minInflowRate: 10,
  maxInflowRate: 200,
  defaultInflowRate: 100,
  minAerationIntensity: 0,
  maxAerationIntensity: 100,
  defaultAerationIntensity: 70,
};

export const COLORS = {
  water: {
    clean: '#2ec4b6',
    dirty: '#8b4513',
    medium: '#6b8e23',
  },
  alert: '#e71d36',
  background: '#1a1a2e',
  accent: '#3e92cc',
  success: '#2ec4b6',
  warning: '#ff9f1c',
};

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'normal',
    name: '正常运行',
    description: '标准工况下的稳定运行状态，处理效果良好',
    icon: 'check',
    inflowRate: 100,
    aerationIntensity: 70,
    inletQuality: { cod: 300, ammoniaNitrogen: 35, totalPhosphorus: 4, ph: 7.2 },
    isRunning: true,
  },
  {
    id: 'shockLoad',
    name: '进水冲击',
    description: '高浓度进水冲击，污染物浓度突然升高导致处理负荷剧增',
    icon: 'zap',
    inflowRate: 180,
    aerationIntensity: 80,
    inletQuality: { cod: 550, ammoniaNitrogen: 70, totalPhosphorus: 8, ph: 6.8 },
    isRunning: true,
  },
  {
    id: 'lowAeration',
    name: '曝气不足',
    description: '曝气设备故障或供氧量不足，微生物处理能力下降',
    icon: 'wind',
    inflowRate: 100,
    aerationIntensity: 15,
    inletQuality: { cod: 300, ammoniaNitrogen: 35, totalPhosphorus: 4, ph: 7.2 },
    isRunning: true,
  },
  {
    id: 'powerRecovery',
    name: '停电恢复',
    description: '长时间停电后恢复供电，各单元水质恶化需逐步恢复',
    icon: 'battery',
    inflowRate: 50,
    aerationIntensity: 40,
    inletQuality: { cod: 420, ammoniaNitrogen: 55, totalPhosphorus: 6, ph: 6.5 },
    isRunning: true,
  },
];
