import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../../../../../components/Navbar';
import axios from 'axios';
import { getApiUrl } from '../../../../../utils/api';

export default function ContestDetails() {
  const router = useRouter();
  const { id, contestId } = router.query;
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [codeByProblem, setCodeByProblem] = useState({});
  const [languageByProblem, setLanguageByProblem] = useState({});
  const [statusByProblem, setStatusByProblem] = useState({});

  useEffect(() => {
    if (!router.isReady) return;
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/login');
      return;
    }
    fetchContest(userId);
  }, [router.isReady]);

  const fetchContest = async (userId) => {
    try {
      setLoading(true);
      setErrorMessage('');
      const [contestRes, leaderboardRes] = await Promise.all([
        axios.get(getApiUrl(`/api/contests/${contestId}?user_id=${userId}`)),
        axios.get(getApiUrl(`/api/contests/${contestId}/leaderboard?user_id=${userId}`))
      ]);

      setContest(contestRes.data?.contest || null);
      setProblems(contestRes.data?.problems || []);
      setLeaderboard(leaderboardRes.data?.leaderboard || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to load contest.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (problemId, value) => {
    setCodeByProblem((prev) => ({ ...prev, [problemId]: value }));
  };

  const handleLanguageChange = (problemId, value) => {
    setLanguageByProblem((prev) => ({ ...prev, [problemId]: value }));
  };

  const submitSolution = async (problemId) => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    const code = codeByProblem[problemId] || '';
    const language = languageByProblem[problemId] || 'python';

    if (!code.trim()) {
      setStatusByProblem((prev) => ({
        ...prev,
        [problemId]: { type: 'error', message: 'Please enter code before submitting.' }
      }));
      return;
    }

    setStatusByProblem((prev) => ({
      ...prev,
      [problemId]: { type: 'info', message: 'Submitting...' }
    }));

    try {
      const response = await axios.post(getApiUrl(`/api/contests/${contestId}/submit`), {
        user_id: userId,
        contest_problem_id: problemId,
        language,
        code
      });

      const payload = response.data;
      setStatusByProblem((prev) => ({
        ...prev,
        [problemId]: {
          type: payload.verdict === 'AC' ? 'success' : 'warning',
          message: `Verdict: ${payload.verdict}, Score: ${payload.score_awarded}, Attempts left: ${payload.attempts_left}`
        }
      }));

      fetchContest(userId);
    } catch (error) {
      setStatusByProblem((prev) => ({
        ...prev,
        [problemId]: {
          type: 'error',
          message: error.response?.data?.error || 'Submission failed.'
        }
      }));
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
        ) : contest ? (
          <>
            <div className="page-header fade-in-up">
              <h1 className="page-title">{contest.name}</h1>
              <p className="page-subtitle">{contest.description || 'No description provided.'}</p>
            </div>

            <div className="feature-card mb-4">
              <h3 className="card-title">Contest Details</h3>
              <div className="d-flex flex-wrap gap-4">
                <div><strong>Start:</strong> {new Date(contest.start_time).toLocaleString()}</div>
                <div><strong>End:</strong> {new Date(contest.end_time).toLocaleString()}</div>
                <div><strong>Max Submissions:</strong> {contest.max_submissions_per_problem}</div>
              </div>
            </div>

            {problems.map((problem) => (
              <div key={problem.id} className="feature-card mb-4">
                <h3 className="card-title">{problem.title}</h3>
                <p className="card-text">{problem.prompt}</p>
                <div className="mb-3">
                  <div><strong>Difficulty:</strong> {problem.difficulty}</div>
                  <div><strong>Base Points:</strong> {problem.base_points}</div>
                  <div><strong>Signature:</strong> {problem.function_signature}</div>
                  <div><strong>Attempts Used:</strong> {problem.attempts_used}</div>
                </div>

                {problem.testcases?.length > 0 && (
                  <div className="mb-3">
                    <h5>Sample Testcases</h5>
                    {problem.testcases.map((testcase, index) => (
                      <div key={`${problem.id}-tc-${index}`} className="mb-2">
                        <div><strong>Input:</strong> {JSON.stringify(testcase.input)}</div>
                        {testcase.expected !== undefined && (
                          <div><strong>Expected:</strong> {JSON.stringify(testcase.expected)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label-custom">Language</label>
                  <select
                    className="form-control form-control-custom"
                    value={languageByProblem[problem.id] || 'python'}
                    onChange={(e) => handleLanguageChange(problem.id, e.target.value)}
                  >
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label-custom">Code</label>
                  <textarea
                    className="form-control form-control-custom"
                    rows="10"
                    style={{ fontFamily: 'monospace' }}
                    value={codeByProblem[problem.id] || ''}
                    onChange={(e) => handleCodeChange(problem.id, e.target.value)}
                    placeholder="Paste your Solution class or function here."
                  ></textarea>
                </div>

                <button
                  className="btn btn-primary-custom"
                  onClick={() => submitSolution(problem.id)}
                >
                  Submit Solution
                </button>

                {statusByProblem[problem.id] && (
                  <div
                    className={`alert mt-3 ${
                      statusByProblem[problem.id].type === 'success'
                        ? 'alert-success'
                        : statusByProblem[problem.id].type === 'error'
                        ? 'alert-danger'
                        : 'alert-warning'
                    }`}
                  >
                    {statusByProblem[problem.id].message}
                  </div>
                )}
              </div>
            ))}

            <div className="feature-card">
              <h3 className="card-title">Leaderboard</h3>
              {leaderboard.length === 0 ? (
                <p className="card-text">No submissions yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-custom">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Total Score</th>
                        <th>Total Time (s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, index) => (
                        <tr key={entry.user_id}>
                          <td>#{index + 1}</td>
                          <td>
                            <Link className="profile-link" href={`/users/${entry.user_id}`}>
                              {entry.name}
                            </Link>
                          </td>
                          <td>{entry.total_score}</td>
                          <td>{entry.total_time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
