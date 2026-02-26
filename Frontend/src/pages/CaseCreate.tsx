import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Shield, AlertCircle, Users, Plus, Trash2, Clock } from 'lucide-react';
import type { CaseStatus, Witness } from '../types';

const CaseCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    crime_level: 3,
    status: 'PENDING' as CaseStatus,
    location: '',
    notes: '',
    reported_at: new Date().toISOString(),
    witnesses: [] as Witness[]
  });

  const [newWitness, setNewWitness] = useState<Witness>({ name: '', phone: '', national_id: '' });

  const validateWitness = (w: Witness) => {
    const phoneRegex = /^09\d{9}$/;
    const nationalIdRegex = /^\d{10}$/;

    if (!w.name.trim()) return "نام شاهد الزامی است.";
    if (!nationalIdRegex.test(w.national_id)) return "کد ملی باید ۱۰ رقم عدد باشد.";
    if (!phoneRegex.test(w.phone)) return "شماره تماس معتبر نیست (مثال: 09123456789).";
    return null;
  };

  const addWitness = () => {
    const validationError = validateWitness(newWitness);
    if (validationError) {
      alert(validationError);
      return;
    }
    setFormData({
      ...formData,
      witnesses: [...formData.witnesses, newWitness]
    });
    setNewWitness({ name: '', phone: '', national_id: '' });
  };

  const removeWitness = (index: number) => {
    const updated = formData.witnesses.filter((_, i) => i !== index);
    setFormData({ ...formData, witnesses: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.witnesses.length === 0) {
      if (!window.confirm("هیچ شاهدی ثبت نشده است. آیا مایل به ادامه هستید؟")) return;
    }

    setLoading(true);
    setError('');
    try {
      // ارسال کل آبجکت شامل witnesses
      await apiService.createCase(formData);
      navigate('/cases');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'خطا در ثبت پرونده.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">ثبت صحنه جرم و تشکیل پرونده</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">عنوان واقعه</label>
            <input
              required
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">سطح جرم</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.crime_level}
              onChange={(e) => setFormData({...formData, crime_level: parseInt(e.target.value)})}
            >
              <option value={3}>سطح ۳ (خرد)</option>
              <option value={2}>سطح ۲ (متوسط)</option>
              <option value={1}>سطح ۱ (بزرگ)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Clock className="h-4 w-4 mr-1" /> زمان وقوع
            </label>
            <input
              required
              type="datetime-local"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              onChange={(e) => setFormData({...formData, reported_at: new Date(e.target.value).toISOString()})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">آدرس دقیق صحنه جرم</label>
          <input
            required
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2" /> اطلاعات شاهدان محلی
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <input
              type="text"
              placeholder="نام شاهد"
              className="text-sm border rounded p-2"
              value={newWitness.name}
              onChange={(e) => setNewWitness({...newWitness, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="کد ملی (۱۰ رقم)"
              className="text-sm border rounded p-2"
              value={newWitness.national_id}
              onChange={(e) => setNewWitness({...newWitness, national_id: e.target.value})}
            />
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="شماره تماس (۰۹...)"
                className="text-sm border rounded p-2 flex-1"
                value={newWitness.phone}
                onChange={(e) => setNewWitness({...newWitness, phone: e.target.value})}
              />
              <button
                type="button"
                onClick={addWitness}
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {formData.witnesses.map((w, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                <span>{w.name} | کد ملی: {w.national_id} | تماس: {w.phone}</span>
                <button type="button" onClick={() => removeWitness(index)} className="text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">توضیحات صحنه جرم</label>
          <textarea
            required
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onClick={() => navigate('/cases')} className="px-4 py-2 bg-gray-100 rounded-md">انصراف</button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? 'در حال ثبت...' : 'ثبت نهایی پرونده'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseCreate;