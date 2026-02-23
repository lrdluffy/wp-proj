import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';
import { Role } from '../types';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: Role.CITIZEN,
    badge_number: '',
    phone_number: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password2,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        badge_number: formData.role === Role.CITIZEN ? undefined : (formData.badge_number || undefined),
        phone_number: formData.phone_number || undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError('Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 p-4 text-red-800 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input name="username" placeholder="Username *" required onChange={handleChange} className="border p-2 rounded" />
            <input name="email" type="email" placeholder="Email *" required onChange={handleChange} className="border p-2 rounded" />
            <input name="first_name" placeholder="First Name *" required onChange={handleChange} className="border p-2 rounded" />
            <input name="last_name" placeholder="Last Name *" required onChange={handleChange} className="border p-2 rounded" />
            <input name="password" type="password" placeholder="Password *" required onChange={handleChange} className="border p-2 rounded" />
            <input name="password2" type="password" placeholder="Confirm Password *" required onChange={handleChange} className="border p-2 rounded" />

              <div>
                <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  required
                  value={formData.password2}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value={Role.TRAINEE}>Trainee</option>
                  <option value={Role.MEDICAL_EXAMINER}>Medical Examiner</option>
                  <option value={Role.POLICE_OFFICER}>Police Officer</option>
                  <option value={Role.PATROL_OFFICER}>Patrol Officer</option>
                  <option value={Role.DETECTIVE}>Detective</option>
                  <option value={Role.SERGEANT}>Sergeant</option>
                  <option value={Role.CAPTAIN}>Captain</option>
                  <option value={Role.POLICE_CHIEF}>Police Chief</option>
                </select>
              </div>

            {formData.role !== Role.CITIZEN && (
              <input name="badge_number" placeholder="Badge Number" onChange={handleChange} className="border p-2 rounded" />
            )}
            <input name="phone_number" placeholder="Phone Number" onChange={handleChange} className="border p-2 rounded" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;