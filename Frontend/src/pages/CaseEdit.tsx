import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { AlertCircle, Save, ArrowRight, Users, Plus, Trash2 } from 'lucide-react';
import { Role } from '../types';
import type { User, CaseStatus, Case } from '../types';

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
    notes: '',
    plaintiffs_info: [] as any[]
  });

  const [newPlaintiff, setNewPlaintiff] = useState({ name: '', phone: '', national_id: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [caseData, usersData] = await Promise.all([
          apiService.getCase(parseInt(id!)) as Promise<Case>,
          apiService.getUsers()
        ]);

        setFormData({
          title: caseData.title,
          description: caseData.description || '',
          crime_level: caseData.crime_level,
          status: caseData.status,
          assigned_to: caseData.assigned_to || '',
          location: caseData.location || '',
          notes: caseData.notes || '',
          plaintiffs_info: caseData.plaintiffs_info || []
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

  const addPlaintiff = () => {
    const phoneRegex = /^09\d{9}$/;
    const nationalIdRegex = /^\d{10}$/;

    if (!newPlaintiff.name.trim()) return alert("نام شاکی الزامی است.");
    if (!nationalIdRegex.test(newPlaintiff.national_id)) return alert("کد ملی باید ۱۰ رقم باشد.");
    if (!phoneRegex.test(newPlaintiff.phone)) return alert("شماره تماس معتبر نیست.");

    setFormData({
      ...formData,
      plaintiffs_info: [...formData.plaintiffs_info, newPlaintiff]
    });
    setNewPlaintiff({ name: '', phone: '', national_id: '' });
  };

  const removePlaintiff = (index: number) => {
    const updated = formData.plaintiffs_info.filter((_, i) => i !== index);
    setFormData({ ...formData, plaintiffs_info: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        assigned_to: formData.assigned_to === '' ? null : Number(formData.assigned_to)
      };

      await apiService.updateCase(parseInt(id!), payload as any);
      navigate(`/cases/${id}`);
    } catch (err: any) {
      setError('خطا در بروزرسانی پرونده. دسترسی خود را بررسی کنید.');
      console.error('Update failed:', err);
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
              {users
                .filter(u => [
                  Role.POLICE_OFFICER,
                  Role.POLICE_OFFICER, // اصلاح شده طبق خطای TS2551
                  Role.DETECTIVE,
                  Role.SERGEANT,
                  Role.CAPTAIN,
                  Role.POLICE_CHIEF
                ].includes(u.role))
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || `${u.first_name} ${u.last_name}` || u.username} ({u.role})
                  </option>
                ))
              }
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

        <div className="border-t pt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2" /> مدیریت شاکیان (Plaintiffs)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <input
              type="text" placeholder="نام شاکی" className="text-sm border rounded p-2"
              value={newPlaintiff.name} onChange={(e) => setNewPlaintiff({...newPlaintiff, name: e.target.value})}
            />
            <input
              type="text" placeholder="کد ملی" className="text-sm border rounded p-2"
              value={newPlaintiff.national_id} onChange={(e) => setNewPlaintiff({...newPlaintiff, national_id: e.target.value})}
            />
            <div className="flex space-x-2">
              <input
                type="text" placeholder="شماره تماس" className="text-sm border rounded p-2 flex-1"
                value={newPlaintiff.phone} onChange={(e) => setNewPlaintiff({...newPlaintiff, phone: e.target.value})}
              />
              <button type="button" onClick={addPlaintiff} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {formData.plaintiffs_info.map((p, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border text-xs">
                <span>{p.name} | {p.national_id} | {p.phone}</span>
                <button type="button" onClick={() => removePlaintiff(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
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