import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Shield, Calendar, User, MapPin, FileText, Fingerprint } from 'lucide-react';

const EvidenceDetail = () => {
  const { id } = useParams();
  const [evidence, setEvidence] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await apiService.getEvidenceDetail(id);
        setEvidence(response);
      } catch (err) { console.error("Error fetching detail:", err); }
    };
    fetchDetail();
  }, [id]);

  if (!evidence) return <div className="p-10 text-center">در حال بارگذاری اطلاعات پرونده...</div>;

  const data = evidence.specific_data;

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen pb-10" dir="rtl">
      {/* Header */}
      <div className="bg-blue-900 p-6 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Shield className="ml-2" /> جزئیات مدرک: {evidence.evidence_number}
            </h1>
            <p className="opacity-80 mt-1">پرونده: {evidence.case_title}</p>
          </div>
          <div className="bg-white text-blue-900 px-4 py-2 rounded-full font-bold">
            {evidence.status_display}
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ستون راست: اطلاعات عمومی */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4 border-b pb-2 flex items-center text-gray-700">
              <FileText className="ml-2 h-5 w-5" /> شرح و توصیف (بند ۴.۳)
            </h3>
            <p className="text-gray-600 leading-relaxed text-justify">
              {evidence.description || "توضیحاتی ثبت نشده است."}
            </p>
          </div>

          {/* نمایش بخش اختصاصی طبق نوع مدرک (بند ۴.۳.۱ تا ۴.۳.۵) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-700">جزئیات فنی مدرک</h3>

            {data?.subtype === 'VEHICLE' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <span className="block text-sm text-blue-600 font-bold">پلاک یا VIN:</span>
                  <span className="text-xl font-mono">{data.plate || data.vin}</span>
                </div>
                <div className="p-4 border rounded-lg">
                  <span className="block text-sm text-gray-500">مدل و رنگ:</span>
                  <span className="font-bold">{data.model} - {data.color}</span>
                </div>
              </div>
            )}

            {data?.subtype === 'IDENTIFICATION' && (
              <div className="space-y-4">
                <div className="flex justify-between p-3 bg-green-50 rounded border border-green-100">
                  <span className="font-bold text-green-800">نوع و شماره مدرک:</span>
                  <span>{data.doc_type} - {data.doc_number}</span>
                </div>
                {/* بخش کلید-مقدار بند ۴.۳.۴ */}
                <div className="mt-4">
                  <span className="text-sm font-bold text-gray-500">سایر اطلاعات (کلید-مقدار):</span>
                  <table className="w-full mt-2 border-collapse">
                    <tbody>
                      {data.extra && Object.entries(data.extra).map(([key, value]: any) => (
                        <tr key={key} className="border-t">
                          <td className="py-2 text-gray-500 font-bold">{key}:</td>
                          <td className="py-2 text-left">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {data?.subtype === 'BIOLOGICAL' && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg flex items-center">
                  <Fingerprint className="ml-3 text-red-600" />
                  <div>
                    <span className="block text-sm font-bold text-red-800">نوع نمونه زیستی:</span>
                    <span className="font-mono">{data.sample}</span>
                  </div>
                </div>
                {/* بخش نتیجه پزشک قانونی - بند ۴.۳.۲ */}
                <div className="p-4 border-2 border-dashed rounded-lg">
                  <span className="text-sm font-bold text-gray-500">نتیجه بررسی (پزشکی قانونی/بانک هویتی):</span>
                  <p className="mt-1 text-gray-700 italic">
                    {data.result || "در انتظار تایید و ارسال نتیجه..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ستون چپ: اطلاعات ثبت و تصویر */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            {evidence.photos ? (
              <img src={evidence.photos} alt="مدرک" className="w-full h-auto rounded-lg shadow-inner" />
            ) : (
              <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg italic">
                تصویری ثبت نشده
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 text-sm space-y-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="ml-2 h-4 w-4" /> <span>ثبت: {new Date(evidence.created_at).toLocaleDateString('fa-IR')}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <User className="ml-2 h-4 w-4" /> <span>ثبت کننده: {evidence.collected_by_name}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="ml-2 h-4 w-4" /> <span>محل کشف: {evidence.location_found || "نامشخص"}</span>
            </div>
          </div>

          <Link to="/evidence" className="block text-center w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition">
            بازگشت به لیست
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetail;