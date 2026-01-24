import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    college: '',
    major: '',
    graduation_year: '',
    bio: ''
  });
  const [summary, setSummary] = useState({ total_problems: 0, total_points: 0 });
  const [difficultyData, setDifficultyData] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/login');
    } else {
      fetchProfile(userId);
      fetchAnalytics(userId);
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl(`/api/users/me?user_id=${userId}`));
      const profileData = response.data?.profile || response.data;
      setProfile(profileData);
      setFormData({
        name: profileData?.name || '',
        age: profileData?.age ?? '',
        college: profileData?.college || '',
        major: profileData?.major || '',
        graduation_year: profileData?.graduation_year ?? '',
        bio: profileData?.bio || ''
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (userId) => {
    try {
      const summaryRes = await axios.get(getApiUrl(`/api/analytics/summary?user_id=${userId}`));
      setSummary(summaryRes.data);

      const diffRes = await axios.get(getApiUrl(`/api/analytics/difficulty?user_id=${userId}`));
      if (diffRes.data.length > 0) {
        setDifficultyData({
          labels: diffRes.data.map(d => d.difficulty),
          datasets: [{
            data: diffRes.data.map(d => d.count),
            backgroundColor: ['#48bb78', '#ed8936', '#f56565'],
            borderWidth: 0
          }]
        });
      }

      const topicRes = await axios.get(getApiUrl(`/api/analytics/topic?user_id=${userId}`));
      if (topicRes.data.length > 0) {
        setTopicData({
          labels: topicRes.data.map(t => t.topic),
          datasets: [{
            label: 'Problems Solved',
            data: topicRes.data.map(t => t.count),
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderRadius: 10
          }]
        });
      }

      const pointsRes = await axios.get(getApiUrl(`/api/analytics/points?user_id=${userId}`));
      if (pointsRes.data.length > 0) {
        setPointsData({
          labels: pointsRes.data.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Total Points',
            data: pointsRes.data.map(p => p.points),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4
          }]
        });
      }
    } catch (error) {
      // silent for now
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');
    setSaving(true);

    try {
      const userId = localStorage.getItem('user_id');
      const payload = {
        user_id: userId,
        name: formData.name,
        age: formData.age === '' ? null : Number(formData.age),
        college: formData.college,
        major: formData.major,
        graduation_year: formData.graduation_year === '' ? null : Number(formData.graduation_year),
        bio: formData.bio
      };
      const response = await axios.put(getApiUrl('/api/users/me'), payload);
      setProfile(response.data?.profile || payload);
      setMessage('Profile updated.');
      localStorage.setItem('user_name', payload.name);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage('New passwords do not match.');
      return;
    }

    try {
      const userId = localStorage.getItem('user_id');
      await axios.post(getApiUrl('/api/users/me/password'), {
        user_id: userId,
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      setPasswordMessage('Password updated successfully.');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setPasswordMessage(error.response?.data?.error || 'Failed to update password.');
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: { size: 12, weight: 'bold' }
        }
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div className="container-custom">
        <div className="page-header fade-in-up">
          <h1 className="page-title">Your Profile</h1>
          <p className="page-subtitle">Manage your details and track your progress</p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger fade-in-up">{errorMessage}</div>
        )}

        {loading ? (
          <div className="text-center">
            <div className="spinner-custom"></div>
          </div>
        ) : (
          <>
            <div className="row g-4 mb-5">
              <div className="col-lg-6">
                <div className="feature-card h-100">
                  <h3 className="card-title">Profile Details</h3>
                  {message && <div className="alert alert-success">{message}</div>}
                  <form onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label-custom">Name</label>
                      <input
                        className="form-control form-control-custom"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label-custom">Age</label>
                      <input
                        type="number"
                        className="form-control form-control-custom"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="10"
                        max="100"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label-custom">College</label>
                      <input
                        className="form-control form-control-custom"
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label-custom">Major</label>
                      <input
                        className="form-control form-control-custom"
                        name="major"
                        value={formData.major}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label-custom">Graduation Year</label>
                      <input
                        type="number"
                        className="form-control form-control-custom"
                        name="graduation_year"
                        value={formData.graduation_year}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label-custom">About</label>
                      <textarea
                        className="form-control form-control-custom"
                        name="bio"
                        rows="4"
                        value={formData.bio}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                    <button className="btn btn-primary-custom" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="feature-card h-100">
                  <h3 className="card-title">Password Reset</h3>
                  {passwordMessage && <div className="alert alert-info">{passwordMessage}</div>}
                  <form onSubmit={handlePasswordChange}>
                    <div className="mb-3">
                      <label className="form-label-custom">Current Password</label>
                      <input
                        type="password"
                        className="form-control form-control-custom"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label-custom">New Password</label>
                      <input
                        type="password"
                        className="form-control form-control-custom"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label-custom">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control form-control-custom"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        required
                      />
                    </div>
                    <button className="btn btn-primary-custom">Update Password</button>
                  </form>
                </div>
              </div>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="feature-card">
                  <h3 className="card-title">Overview</h3>
                  <div className="d-flex flex-wrap gap-4">
                    <div>
                      <h2 style={{ margin: 0 }}>{summary.total_problems}</h2>
                      <div className="text-muted">Problems Solved</div>
                    </div>
                    <div>
                      <h2 style={{ margin: 0 }}>{summary.total_points}</h2>
                      <div className="text-muted">Total Points</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="feature-card">
                  <h3 className="card-title">Public Profile</h3>
                  <p className="card-text">View how others see your profile.</p>
                  <button
                    className="btn btn-primary-custom"
                    onClick={() => router.push(`/users/${profile?.id}`)}
                  >
                    View Public Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="feature-card">
                  <h3 className="card-title">Problems by Difficulty</h3>
                  {difficultyData ? (
                    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                      <Doughnut data={difficultyData} options={chartOptions} />
                    </div>
                  ) : (
                    <p className="text-center text-muted">No data available</p>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="feature-card">
                  <h3 className="card-title">Problems by Topic</h3>
                  {topicData ? (
                    <Bar data={topicData} options={chartOptions} />
                  ) : (
                    <p className="text-center text-muted">No data available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-12">
                <div className="feature-card">
                  <h3 className="card-title">Points Progress Over Time</h3>
                  {pointsData ? (
                    <Line data={pointsData} options={chartOptions} />
                  ) : (
                    <p className="text-center text-muted">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
