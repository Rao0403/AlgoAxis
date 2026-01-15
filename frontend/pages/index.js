import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FaClipboardList, FaChartLine, FaRobot, FaUsers } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({ totalProblems: 0, totalPoints: 0, currentStreak: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [weeklyActivityData, setWeeklyActivityData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Check authentication
    const userId = localStorage.getItem('user_id');
    const name = localStorage.getItem('user_name');
    
    if (!userId) {
      router.push('/login');
    } else {
      setUserName(name || '');
      fetchHomeData(userId);
    }
  }, []);

  const formatDateKey = (value) => {
    if (!value) return null;
    if (typeof value === 'string') {
      const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  };

  const shiftDateKey = (dateKey, daysDelta) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + daysDelta);
    return formatDateKey(date);
  };

  const computeCurrentStreak = (problems) => {
    const dateSet = new Set();
    problems.forEach((problem) => {
      const key = formatDateKey(problem.created_at);
      if (key) dateSet.add(key);
    });

    if (dateSet.size === 0) return 0;

    const sortedDates = Array.from(dateSet).sort();
    let currentKey = sortedDates[sortedDates.length - 1];
    let streak = 0;

    while (dateSet.has(currentKey)) {
      streak += 1;
      currentKey = shiftDateKey(currentKey, -1);
    }

    return streak;
  };

  const buildWeeklyActivityData = (problems) => {
    const countsByDate = {};

    problems.forEach((problem) => {
      const key = formatDateKey(problem.created_at);
      if (!key) return;
      countsByDate[key] = (countsByDate[key] || 0) + 1;
    });

    const labels = [];
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = formatDateKey(date);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      data.push(countsByDate[key] || 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Problems Solved',
          data,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderRadius: 8,
          maxBarThickness: 32
        }
      ]
    };
  };

  const fetchHomeData = async (userId) => {
    try {
      const [problemsRes, leaderboardRes] = await Promise.all([
        axios.get(getApiUrl(`/api/problems?user_id=${userId}`)),
        axios.get(getApiUrl('/api/leaderboard'))
      ]);

      const problems = Array.isArray(problemsRes.data) ? problemsRes.data : [];
      const totalPoints = problems.reduce((sum, problem) => sum + (Number(problem.points) || 0), 0);
      const currentStreak = computeCurrentStreak(problems);

      setStats({
        totalProblems: problems.length,
        totalPoints,
        currentStreak
      });
      setWeeklyActivityData(buildWeeklyActivityData(problems));
      setLeaderboard(Array.isArray(leaderboardRes.data) ? leaderboardRes.data : []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const weeklyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  };

  const features = [
    {
      icon: <FaClipboardList />,
      title: 'Problem Tracker',
      description: 'Log and organize your coding problems by difficulty, topic, and track your progress systematically.',
      link: '/tracker',
      color: '#667eea'
    },
    {
      icon: <FaRobot />,
      title: 'AI Problem Solver',
      description: 'Get step-by-step guidance from AI mentor. Get hints, share ideas, and understand problems deeply.',
      link: '/solver',
      color: '#9333ea'
    },
    {
      icon: <FaChartLine />,
      title: 'Analytics Dashboard',
      description: 'Visualize your progress with beautiful charts showing problems solved by difficulty, topic, and points earned.',
      link: '/dashboard',
      color: '#f56565'
    },
    {
      icon: <FaUsers />,
      title: 'Groups',
      description: 'Create or join groups to stay accountable and prep with friends.',
      link: '/groups',
      color: '#48bb78'
    }
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      
      <div className="container-custom">
        <div className="page-header fade-in-up">
          <h1 className="page-title">
            Welcome to AlgoAxis
          </h1>
          <p className="page-subtitle">
            Algorithm mastery and interview prep in one streamlined workspace
          </p>
        </div>

        <div className="row g-4 mb-5">
          {features.map((feature, index) => (
            <div key={index} className="col-md-6 col-lg-3 fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div 
                className="feature-card h-100"
                onClick={() => router.push(feature.link)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-icon" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="card-title">{feature.title}</h3>
                <p className="card-text">{feature.description}</p>
                <button className="btn btn-primary-custom">
                  Get Started →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="stats-leaderboard-row mb-5">
          <div className="stats-leaderboard-card fade-in-up">
            <div className="feature-card h-100">
              <h3 className="card-title">Quick Stats</h3>
              <p className="card-text mb-4">
                Track your progress with real-time statistics
              </p>
              <div className="row text-center">
                <div className="col-4">
                  <div style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    color: 'white'
                  }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                      {loadingStats ? '--' : stats.totalProblems}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Problems</p>
                  </div>
                </div>
                <div className="col-4">
                  <div style={{ 
                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    color: 'white'
                  }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                      {loadingStats ? '--' : stats.totalPoints}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Points</p>
                  </div>
                </div>
                <div className="col-4">
                  <div style={{ 
                    background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    color: 'white'
                  }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                      {loadingStats ? '--' : stats.currentStreak}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Streak</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-leaderboard-card fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="feature-card h-100">
              <h3 className="card-title">Global Leaderboard</h3>
              <p className="card-text mb-4">See how you rank against other users</p>
              {leaderboard.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-custom">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Problems</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.slice(0, 5).map((user, index) => (
                        <tr key={`${user.email || user.name || 'user'}-${index}`}>
                          <td><strong>#{index + 1}</strong></td>
                          <td><strong>{user.name}</strong></td>
                          <td>{user.total_problems || 0}</td>
                          <td><strong>{user.total_points || 0}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted" style={{ margin: 0 }}>
                  No leaderboard data yet
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-12 fade-in-up">
            <div className="feature-card">
              <h3 className="card-title">Weekly Activity</h3>
              <p className="card-text mb-4">Problems solved in the last 7 days</p>
              {weeklyActivityData ? (
                <div style={{ height: '260px' }}>
                  <Bar data={weeklyActivityData} options={weeklyChartOptions} />
                </div>
              ) : (
                <p className="text-center text-muted" style={{ margin: 0 }}>
                  {loadingStats ? 'Loading activity...' : 'No activity yet'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



