import { useState } from 'react';
import { Download, FileText, TrendingUp, AlertTriangle, BarChart3, Calendar, ArrowLeftRight } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { useSimulationStore } from '../../store/useSimulationStore';
import { exportReportToCSV, downloadCSV, generateReportSummary, exportHistoricalReportToCSV } from '../../utils/reportGenerator';
import { formatNumber } from '../../utils/waterTreatment';
import { HistoricalReport } from '../../types';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyReportModal({ isOpen, onClose }: DailyReportModalProps) {
  const report = useSimulationStore((state) => state.dailyReport);
  const standard = useSimulationStore((state) => state.standard);
  const historicalReports = useSimulationStore((state) => state.historicalReports);
  const reportTab = useSimulationStore((state) => state.reportTab);
  const setReportTab = useSimulationStore((state) => state.setReportTab);

  if (!report) return null;

  const allReports: HistoricalReport[] = [
    ...historicalReports,
    {
      date: report.date,
      totalInflow: report.totalInflow,
      totalOutflow: report.totalOutflow,
      inletQuality: { ...report.inletQuality },
      outletQuality: { ...report.outletQuality },
      complianceRate: report.complianceRate,
      treatmentEfficiency: { ...report.treatmentEfficiency },
      alertCount: report.alertRecords.length,
    },
  ].slice(-7);

  const handleExport = () => {
    const csvContent = reportTab === 'summary' 
      ? exportReportToCSV(report, standard)
      : exportHistoricalReportToCSV(allReports, standard);
    downloadCSV(csvContent, `污水处理日报_${report.date}.csv`);
  };

  const getEfficiencyColor = (value: number) => {
    if (value >= 80) return 'text-emerald-400';
    if (value >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 95) return 'text-emerald-400';
    if (rate >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrendIcon = (current: number, prev: number | undefined) => {
    if (prev === undefined) return null;
    const diff = current - prev;
    if (Math.abs(diff) < 1) return <span className="text-slate-500 text-xs">—</span>;
    return diff > 0 
      ? <span className="text-red-400 text-xs">↑ {diff.toFixed(1)}</span>
      : <span className="text-emerald-400 text-xs">↓ {Math.abs(diff).toFixed(1)}</span>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="污水处理运行日报" maxWidth="max-w-5xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">报告日期: {report.date}</p>
            <p className="text-slate-300 text-sm mt-1">执行标准: {standard.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800/50 rounded-xl p-1">
              <button
                onClick={() => setReportTab('summary')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  reportTab === 'summary'
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText size={16} />
                  日报摘要
                </span>
              </button>
              <button
                onClick={() => setReportTab('history')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  reportTab === 'history'
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BarChart3 size={16} />
                  历史对比
                </span>
              </button>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
            >
              <Download size={18} />
              导出CSV
            </button>
          </div>
        </div>

        {reportTab === 'summary' ? (
          <>
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FileText className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-slate-300 leading-relaxed">
                  {generateReportSummary(report)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-400 text-xs mb-1">总进水量</p>
                <p className="text-2xl font-bold text-white font-mono">
                  {formatNumber(report.totalInflow, 0)}
                  <span className="text-sm text-slate-500 ml-1">m³</span>
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-400 text-xs mb-1">总出水量</p>
                <p className="text-2xl font-bold text-emerald-400 font-mono">
                  {formatNumber(report.totalOutflow, 0)}
                  <span className="text-sm text-slate-500 ml-1">m³</span>
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-400 text-xs mb-1">达标率</p>
                <p className={`text-2xl font-bold font-mono ${getComplianceColor(report.complianceRate)}`}>
                  {formatNumber(report.complianceRate, 1)}
                  <span className="text-sm text-slate-500 ml-1">%</span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                进出水水质对比
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-700/50">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">指标</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">进水</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">出水</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">排放标准</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">去除率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    <tr>
                      <td className="px-4 py-3 text-sm text-slate-300">COD (mg/L)</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-300 font-mono">
                        {formatNumber(report.inletQuality.cod, 1)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        <span className={report.outletQuality.cod <= standard.cod ? 'text-emerald-400' : 'text-red-400'}>
                          {formatNumber(report.outletQuality.cod, 1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-500 font-mono">
                        {standard.cod}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-bold font-mono ${getEfficiencyColor(report.treatmentEfficiency.cod)}`}>
                        {formatNumber(report.treatmentEfficiency.cod, 1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-slate-300">氨氮 (mg/L)</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-300 font-mono">
                        {formatNumber(report.inletQuality.ammoniaNitrogen, 1)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        <span className={report.outletQuality.ammoniaNitrogen <= standard.ammoniaNitrogen ? 'text-emerald-400' : 'text-red-400'}>
                          {formatNumber(report.outletQuality.ammoniaNitrogen, 1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-500 font-mono">
                        {standard.ammoniaNitrogen}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-bold font-mono ${getEfficiencyColor(report.treatmentEfficiency.ammoniaNitrogen)}`}>
                        {formatNumber(report.treatmentEfficiency.ammoniaNitrogen, 1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-slate-300">总磷 (mg/L)</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-300 font-mono">
                        {formatNumber(report.inletQuality.totalPhosphorus, 2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        <span className={report.outletQuality.totalPhosphorus <= standard.totalPhosphorus ? 'text-emerald-400' : 'text-red-400'}>
                          {formatNumber(report.outletQuality.totalPhosphorus, 2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-500 font-mono">
                        {standard.totalPhosphorus}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-bold font-mono ${getEfficiencyColor(report.treatmentEfficiency.totalPhosphorus)}`}>
                        {formatNumber(report.treatmentEfficiency.totalPhosphorus, 1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-slate-300">pH</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-300 font-mono">
                        {formatNumber(report.inletQuality.ph, 1)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        <span className={report.outletQuality.ph >= standard.phMin && report.outletQuality.ph <= standard.phMax ? 'text-emerald-400' : 'text-red-400'}>
                          {formatNumber(report.outletQuality.ph, 1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-500 font-mono">
                        {standard.phMin} - {standard.phMax}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-500">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {report.alertRecords.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  超标记录 ({report.alertRecords.length}次)
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {report.alertRecords.slice(-10).map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-red-400 font-medium text-sm">{alert.unit}</span>
                        <span className="text-slate-400 text-sm">{alert.parameter}</span>
                        <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                          {alert.standardName || standard.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-red-300 text-sm font-mono">
                          {alert.value.toFixed(1)} (限值: {alert.limit.toFixed(1)})
                        </span>
                        <span className="text-slate-500 text-xs">
                          {new Date(alert.timestamp).toLocaleTimeString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ArrowLeftRight className="text-purple-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-slate-300 font-medium mb-1">近7天历史数据对比</p>
                  <p className="text-slate-400 text-sm">包含进出水指标、去除率、达标率和超标次数，方便趋势分析和教学复盘</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" />
                核心指标对比
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-700/50">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">日期</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">处理量(m³)</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">COD出水</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">氨氮出水</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">总磷出水</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">达标率</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">超标次数</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {allReports.map((item, index) => {
                      const isToday = index === allReports.length - 1;
                      const prevCompliance = index > 0 ? allReports[index - 1].complianceRate : undefined;
                      return (
                        <tr 
                          key={item.date}
                          className={isToday ? 'bg-cyan-500/5' : ''}
                        >
                          <td className={`px-4 py-3 text-sm ${isToday ? 'text-cyan-300 font-bold' : 'text-slate-300'}`}>
                            <div className="flex items-center gap-2">
                              {item.date}
                              {isToday && <span className="text-xs px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">今日</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-slate-300 font-mono">
                            {formatNumber(item.totalInflow, 0)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono">
                            <span className={item.outletQuality.cod <= standard.cod ? 'text-emerald-400' : 'text-red-400'}>
                              {formatNumber(item.outletQuality.cod, 1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono">
                            <span className={item.outletQuality.ammoniaNitrogen <= standard.ammoniaNitrogen ? 'text-emerald-400' : 'text-red-400'}>
                              {formatNumber(item.outletQuality.ammoniaNitrogen, 1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono">
                            <span className={item.outletQuality.totalPhosphorus <= standard.totalPhosphorus ? 'text-emerald-400' : 'text-red-400'}>
                              {formatNumber(item.outletQuality.totalPhosphorus, 2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono">
                            <div className="flex items-center justify-end gap-2">
                              <span className={getComplianceColor(item.complianceRate)}>
                                {formatNumber(item.complianceRate, 1)}%
                              </span>
                              {getTrendIcon(item.complianceRate, prevCompliance)}
                            </div>
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-mono ${item.alertCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {item.alertCount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                去除率对比
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {(['cod', 'ammoniaNitrogen', 'totalPhosphorus'] as const).map((param) => {
                  const paramNames = { cod: 'COD', ammoniaNitrogen: '氨氮', totalPhosphorus: '总磷' };
                  const paramColors = { cod: '#ff6b6b', ammoniaNitrogen: '#4ecdc4', totalPhosphorus: '#ffe66d' };
                  return (
                    <div key={param} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-slate-400 text-xs mb-3">{paramNames[param]}去除率趋势</p>
                      <div className="space-y-2">
                        {allReports.slice(-4).map((item, idx) => {
                          const eff = item.treatmentEfficiency[param];
                          const barWidth = Math.max(5, Math.min(100, eff));
                          return (
                            <div key={item.date} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">{item.date.slice(5)}</span>
                                <span className={getEfficiencyColor(eff)}>{eff.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all"
                                  style={{ 
                                    width: `${barWidth}%`,
                                    backgroundColor: paramColors[param],
                                    opacity: 0.8,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-yellow-400" />
                达标率与处理量关系
              </h3>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-end justify-between gap-2 h-32">
                  {allReports.map((item) => {
                    const maxInflow = Math.max(...allReports.map(r => r.totalInflow));
                    const heightPct = (item.totalInflow / maxInflow) * 100;
                    const isToday = item.date === allReports[allReports.length - 1].date;
                    return (
                      <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-slate-500">{formatNumber(item.totalInflow, 0)}</span>
                        <div 
                          className={`w-full rounded-t transition-all ${isToday ? 'bg-gradient-to-t from-cyan-500 to-cyan-400' : 'bg-gradient-to-t from-slate-600 to-slate-500'}`}
                          style={{ height: `${heightPct}%`, minHeight: '8px' }}
                        />
                        <span className={`text-xs ${isToday ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                          {item.date.slice(5)}
                        </span>
                        <span className={`text-xs ${getComplianceColor(item.complianceRate)}`}>
                          {item.complianceRate.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
