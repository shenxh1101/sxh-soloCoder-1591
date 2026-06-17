import { DailyReport, WaterQuality, AlertRecord, WaterQualityHistory, HistoricalReport, TrendAnalysis } from '../types';
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
    ...report.alertRecords.map(a => `${new Date(a.timestamp).toLocaleTimeString()},${a.unitName},${a.parameterName},${a.value.toFixed(1)},${a.limit.toFixed(1)},${a.standardName || standard.name}`),
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

export function analyzeComplianceTrend(reports: HistoricalReport[]): TrendAnalysis {
  if (reports.length < 2) {
    return {
      direction: 'stable',
      changeRate: 0,
      consecutiveDays: 0,
      summary: '数据不足，暂无法分析趋势',
      suggestion: '建议积累至少2天以上的数据后再进行趋势分析',
    };
  }

  const sorted = [...reports].sort((a, b) => {
    const dateA = new Date(a.date.replace(/\//g, '-'));
    const dateB = new Date(b.date.replace(/\//g, '-'));
    return dateA.getTime() - dateB.getTime();
  });

  const len = sorted.length;
  const recentCount = Math.min(3, len);
  const prevCount = Math.min(3, Math.max(0, len - recentCount));

  const recent = sorted.slice(len - recentCount);
  const prev = prevCount > 0 ? sorted.slice(len - recentCount - prevCount, len - recentCount) : [];

  const recentAvg = recent.reduce((sum, r) => sum + r.complianceRate, 0) / recent.length;
  const prevAvg = prev.length > 0
    ? prev.reduce((sum, r) => sum + r.complianceRate, 0) / prev.length
    : sorted[0].complianceRate;

  const changeRate = Number((recentAvg - prevAvg).toFixed(1));

  let direction: TrendAnalysis['direction'] = 'stable';
  if (changeRate > 2) direction = 'improving';
  else if (changeRate < -2) direction = 'worsening';

  let consecutiveDays = 0;
  if (direction !== 'stable') {
    for (let i = len - 1; i >= 1; i--) {
      const diff = sorted[i].complianceRate - sorted[i - 1].complianceRate;
      const isSameDirection = direction === 'improving' ? diff > 0 : diff < 0;
      if (isSameDirection) {
        consecutiveDays++;
      } else {
        break;
      }
    }
  }

  let summary = '';
  let suggestion = '';

  if (direction === 'improving') {
    const rateStr = `提升${changeRate.toFixed(1)}%`;
    if (consecutiveDays >= 2) {
      summary = `连续${consecutiveDays}天改善，累计${rateStr}，运行态势良好`;
    } else {
      summary = `近期运行${rateStr}，处理效果有所改善`;
    }
    if (recentAvg >= 90) {
      suggestion = '继续保持当前运行参数，注意观察进水水质波动，稳定曝气强度';
    } else {
      suggestion = '当前呈改善趋势，建议适当加强曝气强度，优化污泥回流比，争取进一步提升达标率';
    }
  } else if (direction === 'worsening') {
    const rateStr = `下降${Math.abs(changeRate).toFixed(1)}%`;
    if (consecutiveDays >= 2) {
      summary = `连续${consecutiveDays}天下滑，累计${rateStr}，需引起重视`;
    } else {
      summary = `近期运行${rateStr}，处理效果出现波动`;
    }
    if (recentAvg < 75) {
      suggestion = '达标率严重偏低，建议立即排查：检查曝气系统是否正常、污泥活性是否下降、进水是否出现冲击负荷，必要时降低进水量';
    } else {
      suggestion = '处理效果有下降趋势，建议检查各单元运行参数，重点关注曝气池DO浓度和污泥沉降性能，增加监测频次';
    }
  } else {
    if (recentAvg >= 90) {
      summary = `运行稳定，近${recentCount}天达标率维持在${recentAvg.toFixed(1)}%左右，表现优秀`;
      suggestion = '保持当前运行工况，做好日常维护，持续监控关键指标';
    } else if (recentAvg >= 80) {
      summary = `运行平稳，近${recentCount}天达标率约${recentAvg.toFixed(1)}%，有提升空间`;
      suggestion = '运行整体平稳，建议微调运行参数，如适当增加曝气强度或优化加药量，争取将达标率提升至90%以上';
    } else {
      summary = `运行波动较大，近${recentCount}天平均达标率仅${recentAvg.toFixed(1)}%，需持续关注`;
      suggestion = '达标率偏低且波动明显，建议排查工艺稳定性，考虑进行工艺调整或设备检修';
    }
  }

  return {
    direction,
    changeRate,
    consecutiveDays,
    summary,
    suggestion,
  };
}

export function exportHistoricalReportToCSV(
  historicalReports: HistoricalReport[],
  standard: DischargeStandard
): string {
  const sortedReports = [...historicalReports].sort((a, b) => {
    const dateA = new Date(a.date.replace(/\//g, '-'));
    const dateB = new Date(b.date.replace(/\//g, '-'));
    return dateA.getTime() - dateB.getTime();
  });

  const header = [
    '日期',
    '处理量',
    '进水COD',
    '出水COD',
    'COD限值',
    '进水氨氮',
    '出水氨氮',
    '氨氮限值',
    '进水总磷',
    '出水总磷',
    '总磷限值',
    '进水pH',
    '出水pH',
    '达标率',
    '超标次数',
    'COD去除率',
    '氨氮去除率',
    '总磷去除率',
  ];

  const rows = sortedReports.map(r => [
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
    r.inletQuality.ph.toFixed(1),
    r.outletQuality.ph.toFixed(1),
    r.complianceRate.toFixed(1),
    r.alertCount.toString(),
    r.treatmentEfficiency.cod.toFixed(1),
    r.treatmentEfficiency.ammoniaNitrogen.toFixed(1),
    r.treatmentEfficiency.totalPhosphorus.toFixed(1),
  ]);

  const trend = analyzeComplianceTrend(sortedReports);

  const csvContent = [
    `污水处理厂运行日报 - 历史对比数据`,
    `执行标准: ${standard.name}`,
    `生成日期: ${new Date().toLocaleDateString('zh-CN')}`,
    '',
    header.join(','),
    ...rows.map(r => r.join(',')),
    '',
    `趋势分析,${trend.summary}`,
    `操作建议,${trend.suggestion}`,
  ].join('\n');

  return csvContent;
}
