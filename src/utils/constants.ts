import { TreatmentUnitType, DischargeStandard, ParameterInfo, TreatmentUnit, ScenarioPreset, AlertDisposalInfo } from '../types';

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

function createDisposalGuide(
  unit: TreatmentUnitType,
  parameter: string,
  causes: string[],
  suggestions: string[],
  severity: 'low' | 'medium' | 'high'
): AlertDisposalInfo {
  const paramInfo = PARAMETER_INFO.find(p => p.key === parameter) || PARAMETER_INFO[0];
  return {
    parameter,
    parameterName: paramInfo.name,
    unit,
    unitName: UNIT_NAMES[unit],
    causes,
    suggestions,
    severity,
  };
}

const GENERIC_COD_CAUSES = [
  '进水有机物浓度突然升高，超出设计处理能力',
  '微生物活性下降，降解效率降低',
  '停留时间不足，反应不充分',
  '污泥沉降性能差，随出水流失',
];

const GENERIC_COD_SUGGESTIONS = [
  '增加曝气强度，提高溶解氧浓度',
  '检查回流污泥比，确保污泥浓度充足',
  '适当降低进水流量，延长停留时间',
  '检测污泥指标，必要时投加营养物质',
];

const GENERIC_AMMONIA_CAUSES = [
  '硝化细菌数量不足或活性受抑制',
  '溶解氧浓度过低，影响硝化反应',
  'pH值偏离适宜范围，抑制酶活性',
  '温度过低，硝化反应速率下降',
];

const GENERIC_AMMONIA_SUGGESTIONS = [
  '增加曝气，提高溶解氧至2mg/L以上',
  '调整pH值至7.5-8.5的最佳范围',
  '减少进水负荷，延长污泥龄',
  '必要时投加硝化菌剂，加速恢复',
];

const GENERIC_TP_CAUSES = [
  '聚磷菌释放磷后未能有效摄磷',
  '厌氧区溶解氧过高，影响释磷',
  '污泥排放量不足，磷无法排出系统',
  '化学除磷药剂投加量不足',
];

const GENERIC_TP_SUGGESTIONS = [
  '确保厌氧区DO低于0.2mg/L，创造良好释磷环境',
  '增加剩余污泥排放量，排除富磷污泥',
  '适量投加PAC或PFS进行化学除磷',
  '调整污泥回流比，优化聚磷菌生长环境',
];

const GENERIC_PH_LOW_CAUSES = [
  '进水酸度偏高，工业废水混入',
  '硝化反应产酸，系统碱度不足',
  '厌氧消化产生有机酸积累',
  '药剂投加不当，如混凝剂过量',
];

const GENERIC_PH_LOW_SUGGESTIONS = [
  '投加液碱或石灰调节pH至中性',
  '检查进水来源，切断酸性废水',
  '增加碱度补充，如投加碳酸氢钠',
  '调整曝气强度，平衡硝化产酸量',
];

const GENERIC_PH_HIGH_CAUSES = [
  '进水碱性偏高，工业废水混入',
  '药剂投加过量，如消毒剂或混凝剂',
  '氨氮浓度高，氨电离使pH上升',
  '系统曝气过度，CO2大量逸出',
];

const GENERIC_PH_HIGH_SUGGESTIONS = [
  '投加稀硫酸或盐酸调节pH至中性',
  '检查进水来源，切断碱性废水',
  '减少曝气强度，防止CO2过度吹脱',
  '优化处理工艺，降低氨氮负荷',
];

export const ALERT_DISPOSAL_GUIDE: Record<string, AlertDisposalInfo> = {
  'grate-cod': createDisposalGuide('grate', 'cod', [
    '格栅间隙过大，大颗粒有机物未被截留',
    '栅渣清理不及时，腐败有机物溶出',
    '进水流速过快，悬浮物穿透格栅',
    '格栅倾斜角度不当，过滤效果差',
  ], [
    '检查并调整格栅间隙至设计值',
    '立即清理栅渣，防止腐败溶出',
    '控制进水流速在合理范围',
    '检查格栅角度，确保过滤效果',
  ], 'high'),
  'grate-ammoniaNitrogen': createDisposalGuide('grate', 'ammoniaNitrogen', [
    '栅渣腐败分解释放氨氮',
    '格栅截留效率低，含氮有机物穿透',
    '工业废水高氨氮直接进入',
    '预处理停留时间不足',
  ], [
    '及时清渣，防止腐败分解',
    '检查格栅运行状态，确保截留效率',
    '排查工业废水接入并进行预处理',
    '增加预处理停留时间',
  ], 'high'),
  'grate-totalPhosphorus': createDisposalGuide('grate', 'totalPhosphorus', [
    '含磷大颗粒杂物未被截留',
    '栅渣腐败，磷释放到水中',
    '格栅过滤效果不佳',
  ], [
    '确保格栅正常运行，截留大颗粒',
    '及时清理栅渣，避免磷释放',
    '考虑增加一道细格栅',
  ], 'medium'),
  'grate-ph': createDisposalGuide('grate', 'ph', [
    '异常工业废水混入导致pH波动',
    '酸性或碱性废物倾倒',
    '栅渣腐败产生有机酸',
  ], [
    '排查并切断异常废水来源',
    '投加酸碱中和药剂调节pH',
    '加强巡查，及时清理栅渣',
  ], 'low'),

  'sandTank-cod': createDisposalGuide('sandTank', 'cod', [
    '沉砂效率低，有机颗粒未沉降',
    '曝气量过大，卷起已沉砂粒',
    '水力负荷过高，停留时间不足',
    '砂粒吸附有机物后随水流出',
  ], [
    '调整沉砂池曝气量至最佳范围',
    '控制进水流量，延长停留时间',
    '加强排砂，及时清除积砂',
    '检查配水系统，确保均匀布水',
  ], 'high'),
  'sandTank-ammoniaNitrogen': createDisposalGuide('sandTank', 'ammoniaNitrogen', [
    '有机氮颗粒物随砂粒未去除',
    '沉砂池中氨化作用释放氨氮',
    '停留时间过长，厌氧释氨',
  ], [
    '优化排砂周期，减少有机颗粒积累',
    '控制停留时间，避免厌氧环境',
    '加强预处理，降低总氮负荷',
  ], 'high'),
  'sandTank-totalPhosphorus': createDisposalGuide('sandTank', 'totalPhosphorus', [
    '含磷砂粒未有效沉降',
    '积砂时间过长，磷释放到水体',
    '水力负荷过高，磷颗粒被冲走',
  ], [
    '加强排砂，及时清除积砂',
    '优化水力负荷，提高沉降效率',
    '控制停留时间，防止磷释放',
  ], 'medium'),
  'sandTank-ph': createDisposalGuide('sandTank', 'ph', [
    '曝气导致CO2逸出，pH偏高',
    '砂粒中碱性物质溶出',
    '进水pH异常波动',
  ], [
    '适当降低曝气强度',
    '检查进水pH，必要时中和',
    '加强水质监测，稳定进水',
  ], 'low'),

  'primaryTank-cod': createDisposalGuide('primaryTank', 'cod', [
    '表面负荷过高，沉降时间不足',
    '进水SS浓度突增，超出设计能力',
    '刮泥机故障，污泥沉积腐败',
    '水温过低，沉降性能下降',
    '短流现象，短路流影响沉淀',
  ], [
    '降低进水流量，减小表面负荷',
    '强化前端预处理，降低SS浓度',
    '检查并修复刮泥设备，及时排泥',
    '检查配水挡板，消除短流',
    '必要时投加混凝剂助沉',
  ], 'high'),
  'primaryTank-ammoniaNitrogen': createDisposalGuide('primaryTank', 'ammoniaNitrogen', [
    '有机氮颗粒沉降不完全',
    '污泥停留时间过长，氨化释氨',
    '硝化细菌在沉淀池内生长',
  ], [
    '优化排泥周期，减少污泥停留',
    '提高初沉池去除效率',
    '控制污泥层厚度，防止厌氧',
  ], 'high'),
  'primaryTank-totalPhosphorus': createDisposalGuide('primaryTank', 'totalPhosphorus', [
    '初沉池污泥沉降率低，磷未被去除',
    '污泥停留过久，聚磷菌厌氧释磷',
    '排泥不及时，磷重新进入水体',
    '进水总磷浓度突然升高',
  ], [
    '加强排泥，及时去除含磷污泥',
    '控制污泥层高度和停留时间',
    '考虑前端投加化学除磷药剂',
    '降低进水负荷，均衡水量',
  ], 'medium'),
  'primaryTank-ph': createDisposalGuide('primaryTank', 'ph', [
    '污泥腐败产生有机酸，pH下降',
    '进水水质波动，pH异常',
    '混凝剂投加量过大',
  ], [
    '加强排泥，避免污泥腐败',
    '稳定进水水质，必要时中和',
    '调整混凝剂投加量',
  ], 'low'),

  'aerationTank-cod': createDisposalGuide('aerationTank', 'cod', [
    '曝气强度不足，溶解氧低于2mg/L',
    '污泥浓度过低（MLSS不足），微生物量不够',
    '进水量突增，有机负荷冲击',
    '污泥活性受抑制（毒性物质、极端温度）',
    '污泥龄过短或过长，菌群结构失衡',
  ], [
    '增加曝气强度，提高DO至2-4mg/L',
    '检查回流污泥比，确保MLSS在2-4g/L',
    '降低进水流量或分时段进水',
    '排查毒性物质来源，切断或稀释',
    '调整排泥量，优化污泥龄',
  ], 'high'),
  'aerationTank-ammoniaNitrogen': createDisposalGuide('aerationTank', 'ammoniaNitrogen', [
    '溶解氧不足，硝化反应受限',
    'pH低于7.0，硝化细菌活性受抑',
    '污泥龄过短，硝化菌被冲刷',
    '有机负荷过高，异养菌竞争优势',
    '温度低于15℃，硝化速率下降',
  ], [
    '增加曝气，确保DO>2mg/L',
    '投加碱度调节pH至7.5-8.5',
    '减少排泥，延长污泥龄至12天以上',
    '降低进水氨氮负荷',
    '提高水温或投加硝化菌剂',
  ], 'high'),
  'aerationTank-totalPhosphorus': createDisposalGuide('aerationTank', 'totalPhosphorus', [
    '厌氧区DO过高，聚磷菌无法正常释磷',
    '污泥停留时间过长，磷二次释放',
    '进水中易降解碳源不足，影响生物除磷',
    '好氧区停留时间不足，摄磷不充分',
    '排泥量不足，磷无法排出系统',
  ], [
    '严格控制厌氧区DO<0.2mg/L',
    '增加剩余污泥排放量',
    '补充碳源（甲醇、乙酸钠）',
    '确保好氧区足够停留时间',
    '必要时投加PAC辅助化学除磷',
  ], 'medium'),
  'aerationTank-ph': createDisposalGuide('aerationTank', 'ph', [
    '硝化产酸消耗碱度，pH下降',
    '进水酸性或碱性废水冲击',
    '过度曝气导致CO2大量逸出，pH升高',
    '污泥代谢异常，产酸或产碱',
  ], [
    '投加碳酸氢钠补充碱度',
    '排查进水异常并及时处置',
    '调整曝气强度至适宜范围',
    '检查污泥活性，恢复系统平衡',
  ], 'medium'),

  'secondaryTank-cod': createDisposalGuide('secondaryTank', 'cod', [
    '污泥沉降性能差（污泥膨胀），随水流失',
    '回流比过小，污泥积累在二沉池',
    '水力负荷过高，沉淀时间不足',
    '刮吸泥机故障，污泥层过高',
    '污泥腐败上浮，出水浑浊',
  ], [
    '排查污泥膨胀原因（丝状菌）并处理',
    '调整回流比，及时排出污泥',
    '降低进水流量，延长沉淀时间',
    '检修刮吸泥设备，恢复正常运行',
    '增加DO，防止污泥厌氧腐败',
  ], 'high'),
  'secondaryTank-ammoniaNitrogen': createDisposalGuide('secondaryTank', 'ammoniaNitrogen', [
    '硝化不完全，前端曝气池问题',
    '二沉池内发生反硝化，污泥上浮夹带氮',
    '污泥停留过久，氨化释放氨氮',
  ], [
    '重点排查并优化曝气池运行',
    '加快排泥和回流，避免反硝化',
    '控制污泥层高度和停留时间',
  ], 'high'),
  'secondaryTank-totalPhosphorus': createDisposalGuide('secondaryTank', 'totalPhosphorus', [
    '污泥在二沉池停留过久，厌氧释磷',
    '污泥沉降不完全，富磷污泥随水流出',
    '回流不及时，磷重新进入水体',
  ], [
    '加快污泥回流和排泥，减少停留',
    '检查污泥沉降性能（SVI）',
    '确保回流污泥系统正常运行',
  ], 'medium'),
  'secondaryTank-ph': createDisposalGuide('secondaryTank', 'ph', [
    '二沉池内反硝化消耗硝酸盐，pH略有上升',
    '污泥厌氧发酵产酸导致pH下降',
    '前端pH控制不当',
  ], [
    '加强排泥，防止污泥厌氧',
    '优化前端pH调节',
    '控制停留时间，稳定出水pH',
  ], 'low'),

  'disinfectionTank-cod': createDisposalGuide('disinfectionTank', 'cod', [
    '前端处理单元出水COD已超标',
    '消毒池积泥腐败，有机物溶出',
    '消毒剂与有机物反应，副产物增加COD读数',
  ], [
    '重点检查和优化前端处理单元',
    '清理消毒池积泥，防止腐败',
    '优化消毒剂投加量，减少副产物',
  ], 'high'),
  'disinfectionTank-ammoniaNitrogen': createDisposalGuide('disinfectionTank', 'ammoniaNitrogen', [
    '前端硝化不完全，氨氮已超标',
    '消毒时氨与氯反应消耗消毒剂',
    '沉积污泥氨化释放氨氮',
  ], [
    '重点排查前端曝气池硝化效果',
    '加强排泥，清理消毒池沉积物',
    '调整消毒剂投加策略，考虑折点加氯',
  ], 'high'),
  'disinfectionTank-totalPhosphorus': createDisposalGuide('disinfectionTank', 'totalPhosphorus', [
    '前端生物/化学除磷不彻底',
    '消毒池积泥释磷',
    '化学药剂与消毒剂相互影响',
  ], [
    '加强前端除磷工艺控制',
    '清理消毒池积泥',
    '优化除磷药剂和消毒剂投加点',
  ], 'medium'),
  'disinfectionTank-ph': createDisposalGuide('disinfectionTank', 'ph', [
    '消毒剂（次氯酸钠）投加导致pH升高',
    '前端pH控制不稳，传导至末端',
    '消毒副产物形成影响pH',
  ], [
    '调整消毒剂投加量，或更换消毒剂',
    '在消毒前增设pH调节单元',
    '优化前端工艺，稳定pH',
  ], 'medium'),
};

export function getAlertDisposalInfo(
  unitId: TreatmentUnitType,
  parameter: string,
  value?: number,
  limit?: number
): AlertDisposalInfo {
  const key = `${unitId}-${parameter}`;
  if (ALERT_DISPOSAL_GUIDE[key]) {
    return ALERT_DISPOSAL_GUIDE[key];
  }

  const paramInfo = PARAMETER_INFO.find(p => p.key === parameter) || PARAMETER_INFO[0];
  let severity: 'low' | 'medium' | 'high' = 'medium';
  let causes: string[] = [];
  let suggestions: string[] = [];

  switch (parameter) {
    case 'cod':
      severity = 'high';
      causes = GENERIC_COD_CAUSES;
      suggestions = GENERIC_COD_SUGGESTIONS;
      break;
    case 'ammoniaNitrogen':
      severity = 'high';
      causes = GENERIC_AMMONIA_CAUSES;
      suggestions = GENERIC_AMMONIA_SUGGESTIONS;
      break;
    case 'totalPhosphorus':
      severity = 'medium';
      causes = GENERIC_TP_CAUSES;
      suggestions = GENERIC_TP_SUGGESTIONS;
      break;
    case 'ph':
      if (value !== undefined && limit !== undefined) {
        const deviation = Math.abs(value - limit);
        severity = deviation > 1.5 ? 'medium' : 'low';
      } else {
        severity = 'low';
      }
      if (value !== undefined && limit !== undefined && value < limit) {
        causes = GENERIC_PH_LOW_CAUSES;
        suggestions = GENERIC_PH_LOW_SUGGESTIONS;
      } else {
        causes = GENERIC_PH_HIGH_CAUSES;
        suggestions = GENERIC_PH_HIGH_SUGGESTIONS;
      }
      break;
  }

  return {
    parameter,
    parameterName: paramInfo.name,
    unit: unitId,
    unitName: UNIT_NAMES[unitId],
    causes,
    suggestions,
    severity,
  };
}
