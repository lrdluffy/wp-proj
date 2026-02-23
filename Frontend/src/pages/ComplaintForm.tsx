import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';

const ComplaintForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incident_date: '',
    location: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchComplaintData = async () => {
        try {
          const data = await apiService.getComplaint(parseInt(id));
          setFormData({
            title: data.title,
            description: data.description,
            incident_date: data.incident_date || '',
            location: data.location || ''
          });
        } catch (err) {
          alert('Error loading complaint data');
          navigate('/complaints');
        }
      };
      fetchComplaintData();
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && id) {
        await apiService.updateComplaint(parseInt(id), formData);
        alert('Complaint successfully updated and resubmitted.');
      } else {
        await apiService.createComplaint(formData);
        alert('New complaint successfully registered.');
      }
      navigate('/complaints');
    } catch (err) {
      alert('Error submitting information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg" dir="ltr">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit and Resubmit Complaint' : 'Register New Complaint'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Complaint Title</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Incident Description</label>
          <textarea
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Incident Date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.incident_date}
              onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Incident Location</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-bold ${
            loading ? 'bg-gray-400' : isEditMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Sending...' : isEditMode ? 'Update and Resubmit' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;