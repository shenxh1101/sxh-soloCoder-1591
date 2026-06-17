import { DailyReport, WaterQuality, AlertRecord, WaterQualityHistory, HistoricalReport } from '../types';
import { calculateTreatmentEfficiency, calculateComplianceRate } from './waterTreatment';
import { DischargeStandard } from '../types';

export function generateDailyReport(
  date: string,
  totalInflow: number,
  totalOutflow: number,
  inletQuality: WaterQuality,
  outletQuality: WaterQuality,
  standard: DischargeStandard,
  alertRecords: AlertRecord[],
  qualityHistory: WaterQualityHistory[]
): DailyReport {
  const treatmentEfficiency = calculateTreatmentEfficiency(inletQuality, outletQuality);
  
  const samples = qualityHistory
    .filter(h => h.unitId === 'disinfectionTank')
    .map(h => ({ quality: h.quality, standard }));
  
  const complianceRate = calculateComplianceRate(samples);

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    inflow: totalInflow / 24 * (0.8 + Math.random() * 0.4),
    quality: interpolateQualityForHour(inletQuality, outletQuality, i),
  }));

  return {
    date,
    totalInflow,
    totalOutflow,
    inletQuality,
    outletQuality,
    complianceRate,
    treatmentEfficiency,
    alertRecords,
    hourlyData,
  };
}

function interpolateQualityForHour(
  inlet: WaterQuality,
  outlet: WaterQuality,
  hour: number
): WaterQuality {
  const factor = 0.7 + Math.sin(hour / 24 * Math.PI * 2) * 0.3;
  return {
    cod: outlet.cod * factor,
    ammoniaNitrogen: outlet.ammoniaNitrogen * factor,
    totalPhosphorus: outlet.totalPhosphorus * factor,
    ph: outlet.ph + (Math.random() - 0.5) * 0.3,
  };
}

export function exportReportToCSV(report: DailyReport, standard: DischargeStandard): string {
  const header = ['指标', '进水', '出水', '去除率(%)', '排放标准'];
  
  const rows = [
    ['COD (mg/L)', report.inletQuality.cod.toFixed(1), report.outletQuality.cod.toFixed(1), report.treatmentEfficiency.cod.toFixed(1), standard.cod.toString()],
    ['氨氮 (mg/L)', report.inletQuality.ammoniaNitrogen.toFixed(1), report.outletQuality.ammoniaNitrogen.toFixed(1), report.treatmentEfficiency.ammoniaNitrogen.toFixed(1), standard.ammoniaNitrogen.toString()],
    ['总磷 (mg/L)', report.inletQuality.totalPhosphorus.toFixed(2), report.outletQuality.totalPhosphorus.toFixed(2), report.treatmentEfficiency.totalPhosphorus.toFixed(1), standard.totalPhosphorus.toString()],
    ['pH', report.inletQuality.ph.toFixed(1), report.outletQuality.ph.toFixed(1), '-', `${standard.phMin}-${standard.phMax}`],
  ];

  const csvContent = [
    `污水处理厂运行日报 - ${report.date}`,
    `执行标准: ${standard.name}`,
    '',
    `总处理量: ${report.totalInflow.toFixed(0)} m³`,
    `达标率: ${report.complianceRate.toFixed(1)} %`,
    '',
    header.join(','),
    ...rows.map(r => r.join(',')),
    '',
    '超标记录:',
    ...report.alertRecords.map(a => `${new Date(a.timestamp).toLocaleTimeString()},${a.unit},${a.parameter},${a.value.toFixed(1)},${a.limit.toFixed(1)},${a.standardName || standard.name}`),
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateReportSummary(report: DailyReport): string {
  const overall = report.complianceRate >= 95 ? '优秀' : report.complianceRate >= 80 ? '良好' : '需改进';
  
  return `
    今日污水处理运行情况${overall}，共处理污水${report.totalInflow.toFixed(0)}立方米，
    达标率${report.complianceRate.toFixed(1)}%。COD去除率${report.treatmentEfficiency.cod.toFixed(1)}%，
    氨氮去除率${report.treatmentEfficiency.ammoniaNitrogen.toFixed(1)}%，
    总磷去除率${report.treatmentEfficiency.totalPhosphorus.toFixed(1)}%。
    ${report.alertRecords.length > 0 ? `发生${report.alertRecords.length}次超标事件。` : '未发生超标事件。'}
  `.trim();
}

export function exportHistoricalReportToCSV(
  historicalReports: HistoricalReport[],
  standard: DischargeStandard
): string {
  const header = [
    '日期',
    '处理量(m³)',
    '进水COD',
    '出水COD',
    'COD限值',
    '进水氨氮',
    '出水氨氮',
    '氨氮限值',
    '进水总磷',
    '出水总磷',
    '总磷限值',
    '达标率(%)',
    '超标次数',
    'COD去除率(%)',
    '氨氮去除率(%)',
    '总磷去除率(%)',
  ];

  const rows = historicalReports.map(r => [
    r.date,
    r.totalInflow.toFixed(0),
    r.inletQuality.cod.toFixed(1),
    r.outletQuality.cod.toFixed(1),
    standard.cod.toString(),
    r.inletQuality.ammoniaNitrogen.toFixed(1),
    r.outletQuality.ammoniaNitrogen.toFixed(1),
    standard.ammoniaNitrogen.toString(),
    r.inletQuality.totalPhosphorus.toFixed(2),
    r.outletQuality.totalPhosphorus.toFixed(2),
    standard.totalPhosphorus.toString(),
    r.complianceRate.toFixed(1),
    r.alertCount.toString(),
    r.treatmentEfficiency.cod.toFixed(1),
    r.treatmentEfficiency.ammoniaNitrogen.toFixed(1),
    r.treatmentEfficiency.totalPhosphorus.toFixed(1),
  ]);

  const csvContent = [
    `污水处理厂运行日报 - 历史对比数据`,
    `执行标准: ${standard.name}`,
    `生成日期: ${new Date().toLocaleDateString('zh-CN')}`,
    '',
    header.join(','),
    ...rows.map(r => r.join(',')),
    '',
    '说明:',
    '本报告包含最近7天的运行数据对比，用于趋势分析和教学复盘',
  ].join('\n');

  return csvContent;
}
