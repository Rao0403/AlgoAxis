import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../../../components/Navbar';
import axios from 'axios';
import { getApiUrl } from '../../../../utils/api';

export default function GroupContests() {
  const router = useRouter();
  const { id } = router.query;
  const [contests, setContests] = useState([]);
  const [role, setRole] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/login');
      return;
    }
    fetchData(userId);
  }, [router.isReady]);

  const fetchData = async (userId) => {
    try {
      setLoading(true);
      setErrorMessage('');
      const [groupRes, contestRes] = await Promise.all([
        axios.get(getApiUrl(`/api/groups/${id}?user_id=${userId}`)),
        axios.get(getApiUrl(`/api/groups/${id}/contests?user_id=${userId}`))
      ]);

      setGroup(groupRes.data?.group || groupRes.data);
      setContests(contestRes.data?.contests || []);
      setRole(contestRes.data?.role || null);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to load contests.');
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (contest) => {
    const now = new Date();
    const start = new Date(contest.start_time);
    const end = new Date(contest.end_time);
    if (now < start) return 'Upcoming';
    if (now > end) return 'Ended';
    return 'Active';
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div className="container-custom">
        <div className="page-header fade-in-up">
          <h1 className="page-title">Group Contests</h1>
          <p className="page-subtitle">
            {group?.name ? `${group.name} contests` : 'Create and join contests with your group'}
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger fade-in-up">{errorMessage}</div>
        )}

        {role === 'admin' && (
          <div className="mb-4 fade-in-up">
            <button
              className="btn btn-primary-custom"
              onClick={() => router.push(`/groups/${id}/contests/create`)}
            >
              Create Contest
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center">
            <div className="spinner-custom"></div>
          </div>
        ) : contests.length === 0 ? (
          <div className="feature-card fade-in-up text-center">
            <h3 className="card-title">No contests yet</h3>
            <p className="card-text">Create a contest to get started.</p>
          </div>
        ) : (
          <div className="row g-4">
            {contests.map((contest) => (
              <div key={contest.id} className="col-md-6 col-lg-4 fade-in-up">
                <div className="feature-card h-100">
                  <h3 className="card-title">{contest.name}</h3>
                  <p className="card-text">{contest.description || 'No description provided.'}</p>
                  <div className="mb-3">
                    <div><strong>Status:</strong> {getStatus(contest)}</div>
                    <div><strong>Start:</strong> {new Date(contest.start_time).toLocaleString()}</div>
                    <div><strong>End:</strong> {new Date(contest.end_time).toLocaleString()}</div>
                  </div>
                  <button
                    className="btn btn-primary-custom"
                    onClick={() => router.push(`/groups/${id}/contests/${contest.id}`)}
                  >
                    Open Contest
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
