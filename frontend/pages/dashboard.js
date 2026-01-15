import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total_problems: 0, total_points: 0 });
  const [difficultyData, setDifficultyData] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [pointsData, setPointsData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/login');
    } else {
      fetchAnalytics();
    }
  }, []);

  const fetchAnalytics = async () => {
    try {
      const userId = localStorage.getItem('user_id');

      // Fetch summary
      const summaryRes = await axios.get(getApiUrl(`/api/analytics/summary?user_id=${userId}`));
      setSummary(summaryRes.data);

      // Fetch difficulty distribution
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

      // Fetch topic distribution
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

      // Fetch points over time
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
            pointRadius: 5
          }]
        });
      }

      // Fetch leaderboard
      const leaderRes = await axios.get(getApiUrl('/api/leaderboard'));
      setLeaderboard(leaderRes.data);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
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
          <h1 className="page-title">Analytics Dashboard 📊</h1>
          <p className="page-subtitle">Track your progress and performance</p>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-custom"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-6 fade-in-up">
                <div className="feature-card">
                  <div className="d-flex align-items-center">
                    <div style={{ 
                      fontSize: '3rem', 
                      marginRight: '1.5rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      📝
                    </div>
                    <div>
                      <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>
                        {summary.total_problems}
                      </h2>
                      <p className="card-text" style={{ margin: 0 }}>Total Problems Solved</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="feature-card">
                  <div className="d-flex align-items-center">
                    <div style={{ 
                      fontSize: '3rem', 
                      marginRight: '1.5rem',
                      background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      ⭐
                    </div>
                    <div>
                      <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>
                        {summary.total_points}
                      </h2>
                      <p className="card-text" style={{ margin: 0 }}>Total Points Earned</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            {summary.total_problems > 0 ? (
              <>
                <div className="row g-4 mb-5">
                  <div className="col-md-6 fade-in-up">
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

                  <div className="col-md-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
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
                  <div className="col-12 fade-in-up">
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
            ) : (
              <div className="feature-card text-center fade-in-up">
                <h3 className="card-title">No Data Yet 📈</h3>
                <p className="card-text">Start solving problems to see your analytics!</p>
                <button 
                  className="btn btn-primary-custom mt-3"
                  onClick={() => router.push('/tracker')}
                >
                  Go to Tracker
                </button>
              </div>
            )}

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="row g-4 mb-5">
                <div className="col-12 fade-in-up">
                  <div className="feature-card">
                    <h3 className="card-title">🏆 Global Leaderboard</h3>
                    <p className="card-text mb-4">See how you rank against other users</p>
                    <div className="table-responsive">
                      <table className="table table-custom">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Problems Solved</th>
                            <th>Total Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.map((user, index) => (
                            <tr key={index}>
                              <td>
                                <strong style={{ fontSize: '1.2rem' }}>
                                  {index === 0 && '🥇'}
                                  {index === 1 && '🥈'}
                                  {index === 2 && '🥉'}
                                  {index > 2 && `#${index + 1}`}
                                </strong>
                              </td>
                              <td><strong>{user.name}</strong></td>
                              <td>{user.total_problems || 0}</td>
                              <td><strong>{user.total_points || 0}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}