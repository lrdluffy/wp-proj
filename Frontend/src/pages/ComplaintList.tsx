import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { type Complaint, Role } from '../types';

const ComplaintList: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComplaints = async () => {
    try {
      const data = await apiService.getComplaints();
      setComplaints(data.results);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleAction = async (id: number, action: string) => {
    try {
      if (action === 'reject') {
        const feedback = prompt('Enter rejection reason:');
        if (feedback) await apiService.rejectComplaint(id, feedback);
      } else if (action === 'back_to_trainee') {
        const feedback = prompt('Enter reason for returning to trainee:');
        if (feedback) await apiService.sendBackToTrainee(id, feedback);
      } else if (action === 'send_to_officer') {
        await apiService.sendToOfficer(id);
      } else if (action === 'approve') {
        await apiService.approveComplaint(id);
      }
      fetchComplaints();
    } catch (err) { alert('Error performing operation'); }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold">Received Complaints Management</h1>
      <div className="grid gap-4">
        {complaints.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex justify-between items-start text-right">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  c.status === 'VOID' ? 'bg-red-500 text-white' : 
                  c.status === 'RETURNED' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {c.status_display}
                </span>
                <h3 className="font-bold text-lg">{c.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{c.description}</p>
              <div className="text-xs text-gray-400">
                Plaintiff: {c.citizen_detail?.full_name} | Rejections: {c.rejection_count}/3
              </div>
              {c.trainee_feedback && (
                <div className="bg-yellow-50 p-2 text-xs border border-yellow-100 rounded text-yellow-800 italic">
                  Last Feedback: {c.trainee_feedback}
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2 min-w-[160px]">
              {user?.role === Role.CITIZEN && c.status === 'RETURNED' && (
                <Link
                  to={`/complaints/edit/${c.id}`}
                  className="bg-orange-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-orange-700 font-bold shadow-sm"
                >
                  Edit and Resubmit
                </Link>
              )}

              {user?.role === Role.TRAINEE && c.status === 'PENDING' && (
                <>
                  <button onClick={() => handleAction(c.id, 'send_to_officer')} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Approve and Send to Officer</button>
                  <button onClick={() => handleAction(c.id, 'reject')} className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm border border-red-200 hover:bg-red-100">Report Defect to Plaintiff</button>
                </>
              )}

              {user?.role === Role.POLICE_OFFICER && c.status === 'SENT_TO_OFFICER' && (
                <>
                  <button onClick={() => handleAction(c.id, 'approve')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Final Approval and Create Case</button>
                  <button onClick={() => handleAction(c.id, 'back_to_trainee')} className="bg-orange-50 text-orange-600 px-3 py-1 rounded text-sm border border-orange-200">Return to Trainee</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplaintList;