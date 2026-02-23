import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Shield, AlertCircle, MapPin, FileText } from 'lucide-react';
import type { CaseStatus } from '../types';

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
    reported_at: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiService.createCase(formData as any);
      navigate('/cases');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'خطا در ثبت پرونده. دسترسی خود را چک کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">تشکیل پرونده جدید</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" /> {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">عنوان پرونده</label>
          <input
            required
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-gray-700">تاریخ گزارش</label>
            <input
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.reported_at}
              onChange={(e) => setFormData({...formData, reported_at: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <MapPin className="h-4 w-4 mr-1" /> محل وقوع
          </label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="آدرس یا مختصات..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">توضیحات اولیه</label>
          <textarea
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <FileText className="h-4 w-4 mr-1" /> یادداشت‌های داخلی
          </label>
          <textarea
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'در حال ثبت...' : 'تایید و تشکیل پرونده'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseCreate;