import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { type Suspect } from '../types';
import { AlertCircle, Shield, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const UnderPursuitPage: React.FC = () => {
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPursuitList = async () => {
      try {
        const data = await apiService.getSuspects({ in_pursuit: 'true' });
        setSuspects(data.results);
      } catch (error) {
        console.error("خطا در دریافت لیست تعقیب:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPursuitList();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertCircle className="ml-2 text-red-600" />
              افراد تحت پیگرد و متواری
            </h1>
            <p className="text-gray-600 mt-1 font-medium">لیست مظنونین شناسایی شده در پرونده‌های تایید شده که هنوز بازداشت نشده‌اند.</p>
          </div>
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold">
            تعداد کل: {suspects.length} نفر
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suspects.map((suspect) => (
              <div key={suspect.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <UserIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="mr-3">
                      <h2 className="text-lg font-bold text-gray-900">{suspect.full_name}</h2>
                      <span className="text-xs text-gray-500">شناسایی شده توسط: {suspect.identified_by_detail?.full_name || 'نامشخص'}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">کد ملی:</span>
                      <span className="font-mono">{suspect.national_id || '---'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">شماره پرونده:</span>
                      <Link to={`/cases/${suspect.case}`} className="text-blue-600 font-bold hover:underline">
                        {suspect.case_detail?.case_number || `#${suspect.case}`}
                      </Link>
                    </div>
                  </div>

                  <Link
                    to={`/cases/${suspect.case}`}
                    className="mt-6 w-full flex justify-center items-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-bold"
                  >
                    <Shield className="h-4 w-4 ml-2" />
                    مشاهده پرونده و اقدام
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && suspects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg font-medium">در حال حاضر هیچ فرد متواری در پرونده‌های تایید شده وجود ندارد.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnderPursuitPage;