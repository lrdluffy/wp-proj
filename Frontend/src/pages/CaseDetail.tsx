import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/format';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Edit,
  FileText,
  MapPin,
  Shield,
  User,
  Gavel,
  Scale,
  CreditCard,
} from 'lucide-react';
import { type Case, type Suspect, type Trial, CrimeLevel, Role } from '../types';

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [interrogationInputs, setInterrogationInputs] = useState<Record<number, { probability: string; notes: string }>>({});
  const [captainInputs, setCaptainInputs] = useState<Record<number, { final_probability: string; statement: string }>>({});
  const [chiefInputs, setChiefInputs] = useState<Record<number, { approved: string; comment: string }>>({});
  const [bailAmountInputs, setBailAmountInputs] = useState<Record<number, string>>({});
  const [bailSavingId, setBailSavingId] = useState<number | null>(null);
  const [newSuspect, setNewSuspect] = useState<{ first_name: string; last_name: string; national_id: string; phone_number: string }>({
    first_name: '',
    last_name: '',
    national_id: '',
    phone_number: '',
  });
  const fetchData = async () => {
    setLoading(true);
    try {
      if (id) {
        const caseId = parseInt(id);
        const [caseRes, suspectsRes, trialsRes] = await Promise.all([
          apiService.getCase(caseId),
          apiService.getSuspects({ case: caseId }),
          apiService.getTrials({ case: caseId })
        ]);
        setCaseData(caseRes);
        setSuspects(suspectsRes.results || []);
        setTrials(trialsRes.results || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleInterrogationInputChange = (suspectId: number, field: 'probability' | 'notes', value: string) => {
    setInterrogationInputs(prev => ({
      ...prev,
      [suspectId]: { ...prev[suspectId], [field]: value }
    }));
  };

  const handleSubmitInterrogation = async (suspect: Suspect) => {
    const input = interrogationInputs[suspect.id] || { probability: '', notes: '' };
    const prob = parseInt(input.probability);
    if (isNaN(prob) || prob < 1 || prob > 10) return alert('امتیاز باید بین ۱ تا ۱۰ باشد');

    try {
      await apiService.recordInterrogationScore(suspect.id, { probability: prob, notes: input.notes });
      await fetchData();
      alert('امتیاز بازجویی ثبت شد');
    } catch (err) { alert('خطا در ثبت امتیاز'); }
  };

  const canSetBail = user?.role === Role.CAPTAIN || user?.role === Role.POLICE_CHIEF;

  const handleSetBailAmount = async (suspect: Suspect) => {
    const value = bailAmountInputs[suspect.id]?.trim();
    if (!value) return alert('لطفاً مبلغ وثیقه را وارد کنید.');
    const amount = Number(value);
    if (isNaN(amount) || amount <= 0) return alert('مبلغ وثیقه باید عدد مثبت باشد (ریال).');
    setBailSavingId(suspect.id);
    try {
      await apiService.updateSuspect(suspect.id, { bail_amount: value });
      await fetchData();
      setBailAmountInputs(prev => ({ ...prev, [suspect.id]: '' }));
      alert('مبلغ وثیقه ثبت شد');
    } catch (err) {
      alert('خطا در ثبت مبلغ وثیقه');
    } finally {
      setBailSavingId(null);
    }
  };

  const handleStartBailPayment = async (suspect: Suspect) => {
    if (!suspect.bail_amount) {
      return alert('مبلغ وثیقه برای این مظنون ثبت نشده است.');
    }
    if (suspect.bail_paid) {
      return alert('وثیقه این مظنون قبلاً پرداخت شده است.');
    }

    if (!window.confirm(`آیا از شروع پرداخت آنلاین وثیقه به مبلغ ${suspect.bail_amount} ریال برای ${suspect.full_name} مطمئن هستید؟`)) {
      return;
    }

    try {
      const data = await apiService.startBailPayment(suspect.id);
      window.location.href = data.payment_url;
    } catch (error) {
      console.error('Error starting bail payment:', error);
      alert('خطا در شروع پرداخت آنلاین وثیقه');
    }
  };

  const handleSubmitCaptainDecision = async (suspect: Suspect) => {

  };

  const handleSubmitChiefReview = async (suspect: Suspect) => {
    const input = chiefInputs[suspect.id] || { approved: '', comment: '' };
    if (!input.approved) return alert('لطفاً تایید یا رد را انتخاب کنید');

    const approvedValue = input.approved === 'approved';

    try {
      await apiService.submitChiefReview(suspect.id, { approved: approvedValue, comment: input.comment });
      await fetchData();
      alert('نظر رئیس پلیس ثبت شد');
    } catch (err) {
      alert('خطا در ثبت نظر رئیس پلیس');
    }
  };
  const handleArrestSuspect = async (suspect: Suspect) => {
    if (!window.confirm(`آیا از بازداشت ${suspect.full_name} اطمینان دارید؟`)) return;
    try {
      await apiService.arrestSuspect(suspect.id);
      await fetchData();
    } catch (err) { alert('خطا در بازداشت'); }
  };

  const handleApprove = async () => {
    if (!caseData) return;
    setApproving(true);
    try {
      await apiService.approveCase(caseData.id);
      await fetchData();
    } catch (err) { alert('خطا در تایید پرونده'); }
    finally { setApproving(false); }
  };

  const canManageSuspects =
    user?.role &&
    [Role.DETECTIVE, Role.SERGEANT, Role.CAPTAIN, Role.POLICE_CHIEF].includes(user.role);

  const handleCreateSuspect = async () => {
    if (!caseData) return;
    if (!newSuspect.first_name || !newSuspect.last_name) {
      return alert('نام و نام خانوادگی مظنون الزامی است');
    }

    try {
      await apiService.createSuspect({
        case: caseData.id,
        first_name: newSuspect.first_name,
        last_name: newSuspect.last_name,
        national_id: newSuspect.national_id || undefined,
        phone_number: newSuspect.phone_number || undefined,
      });
      setNewSuspect({ first_name: '', last_name: '', national_id: '', phone_number: '' });
      await fetchData();
      alert('مظنون جدید به پرونده اضافه شد');
    } catch (err) {
      alert('خطا در اضافه کردن مظنون');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!caseData) return <div className="text-center py-20 text-gray-600">پرونده یافت نشد.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 text-right" dir="rtl">
      {/* Alert Banner */}
      {!caseData.is_approved && (
        <div className="bg-amber-50 border-r-4 border-amber-400 p-4 rounded-l-lg flex justify-between items-center shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-amber-500 ml-3" />
            <div>
              <p className="text-amber-800 font-bold">این پرونده هنوز تایید نشده است.</p>
            </div>
          </div>
          {['CAPTAIN', 'POLICE_CHIEF', 'SERGEANT'].includes(user?.role || '') && (
            <button onClick={handleApprove} disabled={approving} className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700">
              {approving ? 'در حال تایید...' : 'تایید پرونده'}
            </button>
          )}
        </div>
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/cases')} className="flex items-center text-gray-600 hover:text-blue-600">
          <ArrowRight className="h-5 w-5 ml-1" /> بازگشت به لیست
        </button>
        {user?.role !== 'TRAINEE' && (
          <Link to={`/cases/${caseData.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
            <Edit className="h-4 w-4 ml-2" /> ویرایش پرونده
          </Link>
        )}
      </div>

      {/* Case Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-reverse space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">{caseData.case_number}</h2>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {caseData.status_display}
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{caseData.title}</h1>
            <p className="text-gray-600 whitespace-pre-wrap">{caseData.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <div className="space-y-3">
              <div className="flex items-center text-gray-700"><Clock className="h-5 w-5 ml-2 text-gray-400" /> <b>تاریخ:</b> {formatDate(caseData.reported_at)}</div>
              <div className="flex items-center text-gray-700"><MapPin className="h-5 w-5 ml-2 text-gray-400" /> <b>محل:</b> {caseData.location || 'نامشخص'}</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700"><User className="h-5 w-5 ml-2 text-gray-400" /> <b>مسئول:</b> {caseData.assigned_to_detail?.full_name || 'تخصیص نیافته'}</div>
              <div className="flex items-center text-gray-700"><FileText className="h-5 w-5 ml-2 text-gray-400" /> <b>سطح:</b> {caseData.crime_level_display}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Suspects Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <User className="h-5 w-5 ml-2 text-blue-600" /> لیست مظنونین و وضعیت بازجویی
        </h3>

        {/* Add Suspect Form */}
        {canManageSuspects && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
            <p className="font-bold text-sm text-blue-900">افزودن مظنون جدید به این پرونده</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm"
                placeholder="نام"
                value={newSuspect.first_name}
                onChange={(e) => setNewSuspect(prev => ({ ...prev, first_name: e.target.value }))}
              />
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm"
                placeholder="نام خانوادگی"
                value={newSuspect.last_name}
                onChange={(e) => setNewSuspect(prev => ({ ...prev, last_name: e.target.value }))}
              />
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm"
                placeholder="کد ملی (اختیاری)"
                value={newSuspect.national_id}
                onChange={(e) => setNewSuspect(prev => ({ ...prev, national_id: e.target.value }))}
              />
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm"
                placeholder="شماره تماس (اختیاری)"
                value={newSuspect.phone_number}
                onChange={(e) => setNewSuspect(prev => ({ ...prev, phone_number: e.target.value }))}
              />
            </div>
            <div className="text-left">
              <button
                onClick={handleCreateSuspect}
                className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
              >
                افزودن مظنون
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {suspects.map((suspect) => (
            <div key={suspect.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg">{suspect.full_name}</h4>
                  <p className="text-sm text-gray-500">کد ملی: {suspect.national_id || '---'}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${suspect.is_in_custody ? 'bg-red-100 text-red-700' : 'bg-gray-200'}`}>
                  {suspect.status_display}
                </span>
              </div>

              {/* Arrest Button */}
              {!suspect.is_in_custody && ['SERGEANT', 'CAPTAIN', 'POLICE_CHIEF'].includes(user?.role || '') && (
                <button onClick={() => handleArrestSuspect(suspect)} className="mb-4 bg-red-600 text-white px-3 py-1 rounded text-sm">تایید بازداشت</button>
              )}

              {/* Set bail amount (Captain / Police Chief) */}
              {canSetBail && !suspect.bail_paid && (
                <div className="mt-2 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-bold text-sm text-amber-900 mb-2">تعیین مبلغ وثیقه (ریال)</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder={suspect.bail_amount ? `فعلی: ${suspect.bail_amount}` : 'مبلغ به ریال'}
                      className="border border-amber-300 rounded px-2 py-1 text-sm w-40"
                      value={bailAmountInputs[suspect.id] ?? ''}
                      onChange={(e) => setBailAmountInputs(prev => ({ ...prev, [suspect.id]: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => handleSetBailAmount(suspect)}
                      disabled={bailSavingId === suspect.id}
                      className="bg-amber-600 text-white px-3 py-1 rounded text-sm hover:bg-amber-700 disabled:opacity-50"
                    >
                      {bailSavingId === suspect.id ? 'در حال ثبت...' : 'ثبت مبلغ وثیقه'}
                    </button>
                  </div>
                </div>
              )}

              {/* Bail Payment Section */}
              {suspect.bail_amount && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    مبلغ وثیقه: <span className="font-bold">{suspect.bail_amount}</span> ریال
                  </span>
                  {suspect.bail_paid ? (
                    <span className="text-green-600 font-bold">وثیقه پرداخت شده است</span>
                  ) : (
                    <button
                      onClick={() => handleStartBailPayment(suspect)}
                      className="flex items-center bg-emerald-600 text-white px-3 py-1 rounded text-xs hover:bg-emerald-700"
                    >
                      <CreditCard className="h-3 w-3 ml-1" />
                      پرداخت آنلاین وثیقه
                    </button>
                  )}
                </div>
              )}

              {/* Scoring Section */}
              {suspect.is_in_custody && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-white p-4 rounded border">
                  {/* Interrogation Form */}
                  {['SERGEANT', 'DETECTIVE'].includes(user?.role || '') && (
                    <div className="space-y-3 border-l pl-4">
                      <p className="font-bold text-sm text-blue-800">ثبت امتیاز بازجویی ({user?.role === 'SERGEANT' ? 'گروهبان' : 'کارآگاه'})</p>
                      <input
                        type="number" min="1" max="10" placeholder="احتمال گناهکاری (۱-۱۰)"
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={interrogationInputs[suspect.id]?.probability || ''}
                        onChange={(e) => handleInterrogationInputChange(suspect.id, 'probability', e.target.value)}
                      />
                      <textarea
                        placeholder="یادداشت‌های بازجویی..."
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={interrogationInputs[suspect.id]?.notes || ''}
                        onChange={(e) => handleInterrogationInputChange(suspect.id, 'notes', e.target.value)}
                      />
                      <button onClick={() => handleSubmitInterrogation(suspect)} className="bg-blue-600 text-white px-4 py-1 rounded text-sm w-full">ثبت امتیاز</button>
                    </div>
                  )}

                  {/* Captain Decision Form */}
                  {user?.role === 'CAPTAIN' && suspect.sergeant_probability && suspect.detective_probability && (
                    <div className="space-y-3">
                      <p className="font-bold text-sm text-purple-800">تصمیم نهایی کاپیتان</p>
                      <input
                        type="number" placeholder="امتیاز نهایی" className="w-full border rounded px-2 py-1 text-sm"
                        onChange={(e) => setCaptainInputs(prev => ({...prev, [suspect.id]: {...prev[suspect.id], final_probability: e.target.value}}))}
                      />
                      <textarea
                        placeholder="بیانیه نهایی جهت ارجاع به دادگاه..." className="w-full border rounded px-2 py-1 text-sm"
                        onChange={(e) => setCaptainInputs(prev => ({...prev, [suspect.id]: {...prev[suspect.id], statement: e.target.value}}))}
                      />
                      <button onClick={() => handleSubmitCaptainDecision(suspect)} className="bg-purple-600 text-white px-4 py-1 rounded text-sm w-full">تایید و ارسال به محاکمه</button>
                    </div>
                  )}
                  {/* Police Chief Review for Level 1 Crimes */}
                  {user?.role === 'POLICE_CHIEF' &&
                    caseData.crime_level === CrimeLevel.LEVEL_1 &&
                    suspect.captain_probability &&
                    suspect.chief_approved === null && (
                      <div className="space-y-3">
                        <p className="font-bold text-sm text-red-800">بررسی رئیس پلیس (جرائم سطح بحرانی)</p>
                        <div className="flex gap-2 text-xs">
                          <button
                            type="button"
                            className={`px-3 py-1 rounded border ${
                              chiefInputs[suspect.id]?.approved === 'approved'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-green-700 border-green-300'
                            }`}
                            onClick={() =>
                              setChiefInputs(prev => ({
                                ...prev,
                                [suspect.id]: { ...prev[suspect.id], approved: 'approved' },
                              }))
                            }
                          >
                            تایید تصمیم کاپیتان
                          </button>
                          <button
                            type="button"
                            className={`px-3 py-1 rounded border ${
                              chiefInputs[suspect.id]?.approved === 'rejected'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-red-700 border-red-300'
                            }`}
                            onClick={() =>
                              setChiefInputs(prev => ({
                                ...prev,
                                [suspect.id]: { ...prev[suspect.id], approved: 'rejected' },
                              }))
                            }
                          >
                            رد تصمیم کاپیتان
                          </button>
                        </div>
                        <textarea
                          placeholder="توضیحات رئیس پلیس..."
                          className="w-full border rounded px-2 py-1 text-sm"
                          value={chiefInputs[suspect.id]?.comment || ''}
                          onChange={(e) =>
                            setChiefInputs(prev => ({
                              ...prev,
                              [suspect.id]: { ...prev[suspect.id], comment: e.target.value },
                            }))
                          }
                        />
                        <button
                          onClick={() => handleSubmitChiefReview(suspect)}
                          className="bg-red-700 text-white px-4 py-1 rounded text-sm w-full"
                        >
                          ثبت نظر رئیس پلیس و ادامه روند
                        </button>
                      </div>
                    )}
                </div>
              )}

              {/* Status Summary */}
              <div className="mt-3 flex gap-4 text-xs text-gray-500 italic">
                <span>امتیاز گروهبان: {suspect.sergeant_probability || '---'}</span>
                <span>امتیاز کارآگاه: {suspect.detective_probability || '---'}</span>
                {suspect.captain_probability && <span className="text-purple-600 font-bold">نظر کاپیتان: {suspect.captain_probability}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trial Section (بخش جدید) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <Gavel className="h-5 w-5 ml-2 text-indigo-600" /> روند محاکمه و جلسات دادگاه
        </h3>

        {trials.length > 0 ? (
          <div className="space-y-4">
            {trials.map((trial) => (
              <div key={trial.id} className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded uppercase">{trial.trial_number}</span>
                      <h4 className="font-bold text-gray-900">متهم: {trial.suspect_detail?.full_name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center mt-2">
                      <Scale className="h-4 w-4 ml-1 text-indigo-400" /> مرجع قضایی: {trial.court_name}
                    </p>
                  </div>
                  <div className="text-left">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${trial.is_completed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {trial.status_display}
                    </span>
                    <p className="text-[11px] text-gray-500 mt-2 flex items-center justify-end">
                      {formatDate(trial.scheduled_date)} <Clock className="h-3 w-3 mr-1" />
                    </p>
                  </div>
                </div>

                {trial.verdict && (
                  <div className="mt-4 p-3 bg-white rounded border-r-4 border-indigo-500 shadow-sm">
                    <p className="text-xs font-bold text-indigo-900">حکم دادگاه:</p>
                    <p className="text-sm text-gray-700 mt-1">{trial.verdict_display}</p>
                    {trial.sentence && <p className="text-sm text-red-600 mt-2 font-medium">مجازات: {trial.sentence}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed">
            <p className="text-gray-400 text-sm">هنوز هیچ مظنونی به مرحله محاکمه نرسیده است.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseDetail;