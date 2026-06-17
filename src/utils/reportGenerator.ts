import { DailyReport, WaterQuality, AlertRecord, WaterQualityHistory } from '../types';
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

export function exportReportToCSV(report: DailyReport): string {
  const header = ['指标', '进水', '出水', '去除率(%)', '排放标准'];
  
  const rows = [
    ['COD (mg/L)', report.inletQuality.cod.toFixed(1), report.outletQuality.cod.toFixed(1), report.treatmentEfficiency.cod.toFixed(1), '50'],
    ['氨氮 (mg/L)', report.inletQuality.ammoniaNitrogen.toFixed(1), report.outletQuality.ammoniaNitrogen.toFixed(1), report.treatmentEfficiency.ammoniaNitrogen.toFixed(1), '5'],
    ['总磷 (mg/L)', report.inletQuality.totalPhosphorus.toFixed(2), report.outletQuality.totalPhosphorus.toFixed(2), report.treatmentEfficiency.totalPhosphorus.toFixed(1), '0.5'],
    ['pH', report.inletQuality.ph.toFixed(1), report.outletQuality.ph.toFixed(1), '-', '6-9'],
  ];

  const csvContent = [
    `污水处理厂运行日报 - ${report.date}`,
    '',
    `总处理量: ${report.totalInflow.toFixed(0)} m³`,
    `达标率: ${report.complianceRate.toFixed(1)} %`,
    '',
    header.join(','),
    ...rows.map(r => r.join(',')),
    '',
    '超标记录:',
    ...report.alertRecords.map(a => `${new Date(a.timestamp).toLocaleTimeString()},${a.unit},${a.parameter},${a.value.toFixed(1)},${a.limit.toFixed(1)}`),
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
