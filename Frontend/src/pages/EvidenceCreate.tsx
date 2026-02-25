import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Shield, Save, AlertCircle, Plus, Trash2, Car, User, Upload } from 'lucide-react';
import { EvidenceType, type Case } from '../types';

const EvidenceCreate: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [extraFields, setExtraFields] = useState<{ key: string; value: string }[]>([]);

  const [formData, setFormData] = useState({
    evidence_number: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
    case: '',
    evidence_type: EvidenceType.BIOLOGICAL,
    description: '',
    location_found: '',
    collected_at: new Date().toISOString().slice(0, 16),
    vehicle_license_plate: '',
    vehicle_model: '',
    vehicle_color: '',
    vin_number: '',
    document_type: '',
    document_number: '',
  });

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await apiService.getCases();
        if (response && response.results) setCases(response.results);
      } catch (err) {
        console.error('Error fetching cases:', err);
      }
    };
    fetchCases();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const addExtraField = () => setExtraFields([...extraFields, { key: '', value: '' }]);

  const removeExtraField = (index: number) => {
    const newFields = [...extraFields];
    newFields.splice(index, 1);
    setExtraFields(newFields);
  };

  const handleExtraFieldChange = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...extraFields];
    newFields[index][field] = value;
    setExtraFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.evidence_type === EvidenceType.VEHICLE) {
      if (formData.vehicle_license_plate && formData.vin_number) {
        setError("پلاک و VIN نمی‌توانند همزمان وارد شوند.");
        return;
      }
      if (!formData.vehicle_license_plate && !formData.vin_number) {
        setError("وارد کردن پلاک یا VIN الزامی است.");
        return;
      }
    }

    const data = new FormData();

    data.append('evidence_number', formData.evidence_number);
    data.append('case', formData.case);
    data.append('evidence_type', formData.evidence_type);
    data.append('description', formData.description);
    data.append('collected_at', formData.collected_at);

    if (formData.location_found.trim()) {
        data.append('location_found', formData.location_found);
    }

    if (formData.evidence_type === EvidenceType.VEHICLE) {
        if (formData.vehicle_license_plate) data.append('vehicle_license_plate', formData.vehicle_license_plate);
        if (formData.vin_number) data.append('vin_number', formData.vin_number);
        if (formData.vehicle_model) data.append('vehicle_model', formData.vehicle_model);
        if (formData.vehicle_color) data.append('vehicle_color', formData.vehicle_color);
    }

    if (formData.evidence_type === EvidenceType.IDENTIFICATION) {
      if (formData.document_type) data.append('document_type', formData.document_type);
      if (formData.document_number) data.append('document_number', formData.document_number);
      const extra_details = extraFields.reduce((acc, curr) => {
        if (curr.key.trim()) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);
      data.append('extra_details', JSON.stringify(extra_details));
    }

    if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
            data.append('uploaded_files', file);
        });
    }

    setLoading(true);
    try {
      await apiService.createEvidence(data);
      navigate('/evidence');
    } catch (err: any) {
      console.error("Submit Error:", err.response?.data);
      const serverError = err.response?.data;
      setError(serverError ? JSON.stringify(serverError) : "خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden text-right mb-10" dir="rtl">
      <div className="bg-blue-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center text-white">
          <Shield className="h-6 w-6 ml-2" />
          <h2 className="text-xl font-bold">واحد ثبت شواهد و مدارک جرم</h2>
        </div>
        <span className="text-blue-200 text-sm font-mono">{formData.evidence_number}</span>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded flex items-center overflow-auto max-h-32">
            <AlertCircle className="h-5 w-5 ml-2 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">پرونده مربوطه *</label>
            <select
              required
              value={formData.case}
              onChange={e => setFormData({...formData, case: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-colors"
            >
              <option value="">انتخاب پرونده از لیست...</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">نوع مدرک</label>
            <select
              value={formData.evidence_type}
              onChange={e => setFormData({...formData, evidence_type: e.target.value as EvidenceType})}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
            >
              <optgroup label="شواهد زیستی و فیزیکی">
                <option value={EvidenceType.BIOLOGICAL}>بیولوژیک (خون، مو، DNA)</option>
                <option value={EvidenceType.FINGERPRINT}>اثر انگشت</option>
                <option value={EvidenceType.MEDICAL}>گزارش پزشکی قانونی</option>
              </optgroup>
              <optgroup label="شواهد دیجیتال و استشهاد">
                <option value={EvidenceType.AUDIO}>رونوشت صوتی / استشهاد</option>
                <option value={EvidenceType.VIDEO}>ویدیو صحنه جرم</option>
                <option value={EvidenceType.PHOTOGRAPH}>تصویر مدرک</option>
              </optgroup>
              <optgroup label="اشیاء و وسایل">
                <option value={EvidenceType.VEHICLE}>وسیله نقلیه</option>
                <option value={EvidenceType.IDENTIFICATION}>مدرک شناسایی</option>
                <option value={EvidenceType.WEAPON}>سلاح یا آلت قتاله</option>
                <option value={EvidenceType.OTHER}>سایر موارد (عنوان-توضیح)</option>
              </optgroup>
            </select>
          </div>
        </div>

        <div className="p-5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
          {formData.evidence_type === EvidenceType.VEHICLE && (
            <div className="space-y-4">
              <div className="flex items-center text-blue-800 mb-2"><Car className="ml-2 h-5 w-5"/> <span className="font-bold">جزئیات وسیله نقلیه</span></div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="پلاک خودرو" value={formData.vehicle_license_plate} onChange={e => setFormData({...formData, vehicle_license_plate: e.target.value})} className="p-3 border rounded-lg" />
                <input type="text" placeholder="شماره سریال / VIN" value={formData.vin_number} onChange={e => setFormData({...formData, vin_number: e.target.value})} className="p-3 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="مدل و برند" value={formData.vehicle_model} onChange={e => setFormData({...formData, vehicle_model: e.target.value})} className="p-3 border rounded-lg" />
                <input type="text" placeholder="رنگ" value={formData.vehicle_color} onChange={e => setFormData({...formData, vehicle_color: e.target.value})} className="p-3 border rounded-lg" />
              </div>
            </div>
          )}

          {formData.evidence_type === EvidenceType.IDENTIFICATION && (
            <div className="space-y-4">
              <div className="flex items-center text-green-800 mb-2"><User className="ml-2 h-5 w-5"/> <span className="font-bold">اطلاعات مدرک هویتی</span></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="نوع مدرک" value={formData.document_type} onChange={e => setFormData({...formData, document_type: e.target.value})} className="p-3 border rounded-lg" />
                <input type="text" placeholder="شماره اصلی مدرک" value={formData.document_number} onChange={e => setFormData({...formData, document_number: e.target.value})} className="p-3 border rounded-lg" />
              </div>
              {extraFields.map((field, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input type="text" placeholder="برچسب" value={field.key} onChange={e => handleExtraFieldChange(index, 'key', e.target.value)} className="flex-1 p-2 border rounded" />
                  <input type="text" placeholder="مقدار" value={field.value} onChange={e => handleExtraFieldChange(index, 'value', e.target.value)} className="flex-1 p-2 border rounded" />
                  <button type="button" onClick={() => removeExtraField(index)} className="p-2 text-red-500"><Trash2 className="h-5 w-5"/></button>
                </div>
              ))}
              <button type="button" onClick={addExtraField} className="flex items-center text-sm text-blue-600 font-bold mt-2 hover:underline">
                <Plus className="h-4 w-4 ml-1" /> افزودن مشخصه جدید
              </button>
            </div>
          )}

          <div className="mt-4">
             <label className="flex items-center text-gray-700 font-bold mb-2">
               <Upload className="ml-2 h-5 w-5 text-blue-600" /> آپلود مستندات (تصویر، ویدیو، صوت)
             </label>
             <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              accept="image/*,video/*,audio/*,.pdf"
             />
             <div className="flex gap-2 mt-2 flex-wrap">
               {selectedFiles.map((f, i) => (
                 <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                   {f.name.substring(0, 15)}...
                 </span>
               ))}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">محل کشف مدرک</label>
            <input type="text" value={formData.location_found} onChange={e => setFormData({...formData, location_found: e.target.value})} className="w-full p-3 border-2 border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">زمان جمع‌آوری</label>
            <input type="datetime-local" value={formData.collected_at} onChange={e => setFormData({...formData, collected_at: e.target.value})} className="w-full p-3 border-2 border-gray-200 rounded-lg" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">شرح کامل مدرک *</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-reverse space-x-4 pt-6 border-t border-gray-100">
          <button type="button" onClick={() => navigate('/evidence')} className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors">
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center disabled:opacity-50"
          >
            {loading ? 'در حال ثبت...' : (
              <>
                <Save className="h-5 w-5 ml-2" /> ذخیره و تایید مدرک
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvidenceCreate;