import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { getApiUrl } from '../../utils/api';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function PublicProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState({ total_problems: 0, total_points: 0 });
  const [difficultyData, setDifficultyData] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    fetchProfile();
    fetchAnalytics();
  }, [router.isReady]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl(`/api/users/${id}`));
      setProfile(response.data?.profile || response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Profile not found.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const summaryRes = await axios.get(getApiUrl(`/api/analytics/summary?user_id=${id}`));
      setSummary(summaryRes.data);

      const diffRes = await axios.get(getApiUrl(`/api/analytics/difficulty?user_id=${id}`));
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

      const topicRes = await axios.get(getApiUrl(`/api/analytics/topic?user_id=${id}`));
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

      const pointsRes = await axios.get(getApiUrl(`/api/analytics/points?user_id=${id}`));
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
      // ignore if analytics are empty
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
        {errorMessage && (
          <div className="alert alert-danger fade-in-up">{errorMessage}</div>
        )}

        {loading ? (
          <div className="text-center">
            <div className="spinner-custom"></div>
          </div>
        ) : profile ? (
          <>
            <div className="page-header fade-in-up">
              <h1 className="page-title">{profile.name}</h1>
              <p className="page-subtitle">{profile.bio || 'AlgoAxis member'}</p>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="feature-card">
                  <h3 className="card-title">Profile Info</h3>
                  <div className="d-flex flex-column gap-2">
                    <div><strong>College:</strong> {profile.college || '—'}</div>
                    <div><strong>Major:</strong> {profile.major || '—'}</div>
                    <div><strong>Graduation Year:</strong> {profile.graduation_year || '—'}</div>
                    <div><strong>Age:</strong> {profile.age || '—'}</div>
                  </div>
                </div>
              </div>
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
        ) : null}
      </div>
    </div>
  );
}
