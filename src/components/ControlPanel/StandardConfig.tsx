import { useState } from 'react';
import { Modal } from '../UI/Modal';
import { useSimulationStore } from '../../store/useSimulationStore';
import { DEFAULT_STANDARD, ALTERNATIVE_STANDARDS } from '../../utils/constants';
import { DischargeStandard } from '../../types';

interface StandardConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StandardConfig({ isOpen, onClose }: StandardConfigProps) {
  const currentStandard = useSimulationStore((state) => state.standard);
  const updateStandard = useSimulationStore((state) => state.updateStandard);
  
  const [formData, setFormData] = useState<DischargeStandard>(currentStandard);

  const handlePresetSelect = (preset: DischargeStandard) => {
    setFormData(preset);
  };

  const handleChange = (field: keyof DischargeStandard, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    updateStandard(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData(DEFAULT_STANDARD);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="排放标准配置">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">预设标准</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePresetSelect(DEFAULT_STANDARD)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                formData.name === DEFAULT_STANDARD.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {DEFAULT_STANDARD.name}
            </button>
            {ALTERNATIVE_STANDARDS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.name === preset.name
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-6">
          <h3 className="text-sm font-medium text-slate-400 mb-4">自定义参数</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">标准名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">COD限值 (mg/L)</label>
              <input
                type="number"
                value={formData.cod}
                onChange={(e) => handleChange('cod', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">氨氮限值 (mg/L)</label>
              <input
                type="number"
                value={formData.ammoniaNitrogen}
                onChange={(e) => handleChange('ammoniaNitrogen', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">总磷限值 (mg/L)</label>
              <input
                type="number"
                step="0.1"
                value={formData.totalPhosphorus}
                onChange={(e) => handleChange('totalPhosphorus', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">pH最小值</label>
              <input
                type="number"
                step="0.1"
                value={formData.phMin}
                onChange={(e) => handleChange('phMin', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">pH最大值</label>
              <input
                type="number"
                step="0.1"
                value={formData.phMax}
                onChange={(e) => handleChange('phMax', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
          >
            重置默认
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            保存设置
          </button>
        </div>
      </div>
    </Modal>
  );
}
