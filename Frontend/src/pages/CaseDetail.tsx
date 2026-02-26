import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/format';
import { Shield, Clock, MapPin, User, FileText, ArrowRight, Edit, Users, CheckCircle, AlertTriangle, UserPlus, Car, Fingerprint, Search } from 'lucide-react';
import type { Case } from '../types';

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

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

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleApprove = async () => {
    if (!caseData || !window.confirm('آیا از تایید این پرونده اطمینان دارید؟')) return;
    setApproving(true);
    try {
      await apiService.approveCase(caseData.id);
      await fetchCase();
    } catch (err) {
      alert('خطا در تایید پرونده');
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!caseData) return <div className="text-center py-20 text-gray-600">پرونده مورد نظر یافت نشد.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 text-right" dir="rtl">
      {!caseData.is_approved && (
        <div className="bg-amber-50 border-r-4 border-amber-400 p-4 rounded-l-lg flex justify-between items-center shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-amber-500 ml-3" />
            <div>
              <p className="text-amber-800 font-bold">این پرونده هنوز تایید نشده است.</p>
              <p className="text-amber-700 text-sm">پرونده‌های تایید نشده برای کارآموزان قابل مشاهده نیستند.</p>
            </div>
          </div>
          {['CAPTAIN', 'POLICE_CHIEF', 'SERGEANT'].includes(user?.role || '') && (
            <button onClick={handleApprove} disabled={approving} className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 flex items-center transition-colors">
              <CheckCircle className="h-4 w-4 ml-2" /> {approving ? 'در حال تایید...' : 'تایید پرونده'}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/cases')} className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
          <ArrowRight className="h-5 w-5 ml-1" /> بازگشت به لیست
        </button>
        {user?.role !== 'TRAINEE' && (
          <Link to={`/cases/${caseData.id}/edit`} className="flex items-center space-x-reverse space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Edit className="h-4 w-4" /> <span>ویرایش پرونده</span>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-reverse space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{caseData.case_number}</h2>
          </div>
          <div className="flex items-center space-x-reverse space-x-2">
            {caseData.is_approved && (
               <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                 <CheckCircle className="h-3 w-3 ml-1" /> تایید شده
               </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${caseData.status === 'CLOSED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              {caseData.status_display}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{caseData.title}</h1>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{caseData.description || 'توضیحاتی ثبت نشده است.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 ml-3 text-gray-400" />
                <span className="font-medium ml-2">تاریخ گزارش:</span> {formatDate(caseData.reported_at)}
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 ml-3 text-gray-400" />
                <span className="font-medium ml-2">محل وقوع:</span>
                <span className={caseData.location ? 'text-gray-900' : 'text-gray-400 italic'}>{caseData.location || 'نامشخص'}</span>
              </div>
            </div>
            <div className="space-y-4">
             <div className="flex items-center text-gray-700">
              <User className="h-5 w-5 ml-3 text-gray-400" />
                <span className="font-medium ml-2">مسئول پرونده:</span>
                <span className={caseData.assigned_to_detail ? 'text-gray-900 font-bold' : 'text-gray-400 italic'}>{caseData.assigned_to_detail?.full_name || caseData.assigned_to_detail?.username || 'تخصیص داده نشده'}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <FileText className="h-5 w-5 ml-3 text-gray-400" />
                <span className="font-medium ml-2">سطح جرم:</span>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-sm">{caseData.crime_level_display}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <UserPlus className="h-5 w-5 ml-2 text-green-600" /> لیست شاکیان پرونده
            </h3>
            {caseData.plaintiffs_info && caseData.plaintiffs_info.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {caseData.plaintiffs_info.map((plaintiff, index) => (
                  <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-100 flex justify-between items-center">
                    <div><p className="text-sm font-bold text-gray-800">{plaintiff.name}</p><p className="text-xs text-gray-500">کد ملی: {plaintiff.national_id}</p></div>
                    <div className="text-left"><p className="text-xs text-green-700 font-bold">{plaintiff.phone}</p></div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm italic">هیچ شاکی ثبت نشده است.</p>}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 ml-2 text-blue-600" /> لیست شاهدان و مطلعین
            </h3>
            {caseData.crime_scene?.witnesses_info && caseData.crime_scene.witnesses_info.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {caseData.crime_scene.witnesses_info.map((witness, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                    <div><p className="text-sm font-bold text-gray-800">{witness.name}</p><p className="text-xs text-gray-500">کد ملی: {witness.national_id}</p></div>
                    <div className="text-left"><p className="text-xs text-blue-600 font-medium">{witness.phone}</p></div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm italic">شاهدی ثبت نشده است.</p>}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Search className="h-5 w-5 ml-2 text-purple-600" /> شواهد فنی و مستندات یافت شده
            </h3>
            {caseData.evidence_items && caseData.evidence_items.length > 0 ? (
              <div className="space-y-4">
                {caseData.evidence_items.map((evidence, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        {evidence.evidence_type === 'VEHICLE' ? <Car className="h-5 w-5 ml-2 text-blue-500" /> : <Fingerprint className="h-5 w-5 ml-2 text-purple-500" />}
                        <span className="font-bold text-gray-900">{evidence.evidence_number} - {evidence.evidence_type_display}</span>
                      </div>
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">{evidence.status_display}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{evidence.description}</p>
                    {evidence.evidence_type === 'VEHICLE' && (
                      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2 rounded">
                        <div><span className="text-gray-500">مدل:</span> {evidence.vehicle_model}</div>
                        <div><span className="text-gray-500">پلاک:</span> {evidence.vehicle_license_plate || 'ندارد'}</div>
                        <div><span className="text-gray-500">رنگ:</span> {evidence.vehicle_color}</div>
                        <div><span className="text-gray-500">شماره سریال:</span> {evidence.vin_number || 'ندارد'}</div>
                      </div>
                    )}
                    <div className="mt-2 text-[10px] text-gray-400 flex justify-between">
                      <span>یافت شده در: {evidence.location_found}</span>
                      <span>توسط: {evidence.collected_by_detail?.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm italic">مدرک فنی ثبت نشده است.</p>}
          </div>

          {caseData.notes && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <h3 className="text-sm font-bold text-yellow-800 mb-2 flex items-center"><FileText className="h-4 w-4 ml-1" /> یادداشت‌های مدیریتی:</h3>
              <p className="text-yellow-900 text-sm leading-relaxed whitespace-pre-wrap">{caseData.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;