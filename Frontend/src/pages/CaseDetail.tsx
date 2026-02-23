import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/format';
import { Shield, Clock, MapPin, User, FileText, ArrowLeft, Edit } from 'lucide-react';
import type { Case } from '../types';

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        if (id) {
          const data = await apiService.getCase(parseInt(id));
          setCaseData(data);
        }
      } catch (error) {
        console.error('Error fetching case details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!caseData) return <div className="text-center py-20 text-gray-600">پرونده مورد نظر یافت نشد.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/cases')} className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-1" /> بازگشت به لیست
        </button>

        {user?.role !== 'TRAINEE' && (
          <Link
            to={`/cases/${caseData.id}/edit`}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Edit className="h-4 w-4" />
            <span>ویرایش پرونده</span>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{caseData.case_number}</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${caseData.status === 'CLOSED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {caseData.status_display}
          </span>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{caseData.title}</h1>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{caseData.description || 'توضیحاتی ثبت نشده است.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-3 text-gray-400" />
                <span className="font-medium mr-2">تاریخ گزارش:</span>
                {formatDate(caseData.reported_at)}
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                <span className="font-medium mr-2">محل وقوع:</span>
                <span className={caseData.location ? 'text-gray-900' : 'text-gray-400 italic'}>
                  {caseData.location || 'نامشخص'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
             <div className="flex items-center text-gray-700">
              <User className="h-5 w-5 mr-3 text-gray-400" />
                <span className="font-medium mr-2">مسئول پرونده:</span>
                <span className={caseData.assigned_to_detail ? 'text-gray-900 font-bold' : 'text-gray-400 italic'}>
                  {caseData.assigned_to_detail
                    ? (caseData.assigned_to_detail.full_name ||
                       `${caseData.assigned_to_detail.first_name} ${caseData.assigned_to_detail.last_name}` ||
                       caseData.assigned_to_detail.username)
                    : 'تخصیص داده نشده'}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <FileText className="h-5 w-5 mr-3 text-gray-400" />
                <span className="font-medium mr-2">سطح جرم:</span>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-sm">
                  {caseData.crime_level_display}
                </span>
              </div>
            </div>
          </div>

          {(caseData.notes || caseData.location) && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <h3 className="text-sm font-bold text-yellow-800 mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-1" /> یادداشت‌های مدیریتی و فنی:
              </h3>
              <p className="text-yellow-900 text-sm leading-relaxed whitespace-pre-wrap">
                {caseData.notes || "یادداشتی برای این پرونده ثبت نشده است."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;