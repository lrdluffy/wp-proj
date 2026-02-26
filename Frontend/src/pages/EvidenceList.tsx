import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { formatDate } from '../utils/format';
import { Search, Plus, Car, Fingerprint, Eye } from 'lucide-react';
import type { Evidence } from '../types';

const EvidenceList: React.FC = () => {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const data = await apiService.getEvidence();
        setEvidence(data.results);
      } catch (error) {
        console.error('Error fetching evidence:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvidence();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">مدیریت شواهد فنی</h1>
        <Link to="/evidence/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors">
          <Plus className="h-5 w-5 ml-2" /> ثبت مدرک جدید
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {evidence.length > 0 ? evidence.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-reverse space-x-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  {item.evidence_type === 'VEHICLE' ? <Car /> : <Fingerprint />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{item.evidence_number}</h3>
                  <p className="text-sm text-gray-500">{item.evidence_type_display} - {formatDate(item.collected_at)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {item.status_display}
                </span>
                {/* دکمه مشاهده جزئیات */}
                <Link
                  to={`/evidence/${item.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="مشاهده جزئیات"
                >
                  <Eye className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="mt-4 text-gray-600 text-sm">
              <p>{item.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
              <span>محل یافت: {item.location_found || 'نامشخص'}</span>
              <span>توسط: {item.collected_by_detail?.username || 'ناشناس'}</span>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">هیچ مدرکی در سیستم یافت نشد.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceList;