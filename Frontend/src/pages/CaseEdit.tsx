import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { AlertCircle, Save, ArrowRight } from 'lucide-react';
import type { User, CaseStatus } from '../types';

const CaseEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    crime_level: 3,
    status: '' as CaseStatus,
    assigned_to: '' as string | number,
    location: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [caseData, usersData] = await Promise.all([
          apiService.getCase(parseInt(id!)),
          apiService.getUsers()
        ]);

        setFormData({
          title: caseData.title,
          description: caseData.description || '',
          crime_level: caseData.crime_level,
          status: caseData.status,
          assigned_to: caseData.assigned_to || '',
          location: caseData.location || '',
          notes: caseData.notes || ''
        });
        setUsers(usersData.results);
      } catch (err) {
        setError('خطا در دریافت اطلاعات پرونده');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (payload.assigned_to === '') (payload as any).assigned_to = null;

      await apiService.updateCase(parseInt(id!), payload as any);
      navigate(`/cases/${id}`);
    } catch (err: any) {
      setError('خطا در بروزرسانی پرونده. دسترسی خود را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.title) return <div className="p-10 text-center">در حال بارگذاری...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">ویرایش پرونده</h2>
        <button onClick={() => navigate(-1)} className="text-gray-500 flex items-center hover:text-gray-700">
           بازگشت <ArrowRight className="h-5 w-5 ml-1" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">عنوان</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">وضعیت پرونده</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as CaseStatus})}
            >
              <option value="PENDING">Pending</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="AWAITING_TRIAL">Awaiting Trial</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 text-blue-600 font-bold">تخصیص به (مسئول پرونده)</label>
            <select
              className="mt-1 block w-full border-2 border-blue-200 rounded-md p-2"
              value={formData.assigned_to}
              onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
            >
              <option value="">تخصیص داده نشده</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">سطح جرم</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.crime_level}
              onChange={(e) => setFormData({...formData, crime_level: parseInt(e.target.value)})}
            >
              <option value={1}>سطح ۱</option>
              <option value={2}>سطح ۲</option>
              <option value={3}>سطح ۳</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">محل وقوع</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">توضیحات</label>
          <textarea
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 text-yellow-700">یادداشت‌های مدیریتی</label>
          <textarea
            rows={2}
            className="mt-1 block w-full border border-yellow-200 bg-yellow-50 rounded-md p-2"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-1" />
            <span>{loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseEdit;