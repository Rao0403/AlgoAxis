import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import { FaPlus, FaEdit, FaTrash, FaMagic, FaLightbulb, FaStickyNote } from 'react-icons/fa';

export default function Tracker() {
  const router = useRouter();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('None');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    difficulty: 'Easy',
    topic: '',
    summary: '',
    notes: ''
  });

  const topics = ['None', 'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 
                  'Greedy', 'Backtracking', 'Binary Search', 'Sorting', 'Hash Tables', 'Stacks & Queues',
                  'Heaps', 'Bit Manipulation', 'Math', 'Recursion', 'Sliding Window', 'Two Pointers'];

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/login');
    } else {
      fetchProblems();
    }
  }, []);

  const fetchProblems = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await axios.get(getApiUrl(`/api/problems?user_id=${userId}`));
      setProblems(response.data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id');

    try {
      if (editingProblem) {
        // Update existing problem
        await axios.put(getApiUrl(`/api/problems/${editingProblem.id}`), formData);
      } else {
        // Add new problem
        await axios.post(getApiUrl('/api/problems'), {
          ...formData,
          user_id: userId
        });
      }

      // Reset form and refresh
      setFormData({
        number: '',
        name: '',
        difficulty: 'Easy',
        topic: '',
        summary: ''
      });
      setEditingProblem(null);
      setShowModal(false);
      fetchProblems();
    } catch (error) {
      console.error('Error saving problem:', error);
      alert('Failed to save problem. Please try again.');
    }
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setFormData({
      number: problem.number,
      name: problem.name,
      difficulty: problem.difficulty,
      topic: problem.topic,
      summary: problem.summary || '',
      notes: problem.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (problemId) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;

    try {
      await axios.delete(getApiUrl(`/api/problems/${problemId}`));
      fetchProblems();
    } catch (error) {
      console.error('Error deleting problem:', error);
      alert('Failed to delete problem. Please try again.');
    }
  };

  const handleSuggestProblems = async () => {
    setLoadingRecommendations(true);
    setRecommendations([]);

    try {
      const userId = localStorage.getItem('user_id');
      const response = await axios.post(getApiUrl('/api/suggest-problems'), {
        user_id: userId,
        topic: selectedTopic === 'None' ? null : selectedTopic
      });

      setRecommendations(response.data.recommendations || []);
      
      if (response.data.recommendations.length === 0 && response.data.raw_text) {
        alert('Received recommendations but could not parse them. Check console for details.');
        console.log('Raw recommendations:', response.data.raw_text);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Failed to get recommendations. Please make sure Gemini API is configured.');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleViewNotes = (problem) => {
    setSelectedProblem(problem);
    setShowNotesModal(true);
  };

  const getDifficultyBadge = (difficulty) => {
    const classes = {
      Easy: 'badge-easy',
      Medium: 'badge-medium',
      Hard: 'badge-hard'
    };
    return <span className={`badge ${classes[difficulty]}`}>{difficulty}</span>;
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      
      <div className="container-custom">
        <div className="page-header fade-in-up">
          <h1 className="page-title">Problem Tracker 📝</h1>
          <p className="page-subtitle">Keep track of all your coding problems</p>
        </div>

        <div className="mb-4 fade-in-up">
          <button 
            className="btn btn-primary-custom me-2"
            onClick={() => {
              setEditingProblem(null);
              setFormData({
                number: '',
                name: '',
                difficulty: 'Easy',
                topic: '',
                summary: '',
                notes: ''
              });
              setShowModal(true);
            }}
          >
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Add New Problem
          </button>
          
          <button 
            className="btn btn-success"
            onClick={() => {
              setSelectedTopic('None');
              setRecommendations([]);
              setShowSuggestModal(true);
            }}
          >
            <FaMagic style={{ marginRight: '0.5rem' }} />
            Suggest Problems (AI)
          </button>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-custom"></div>
          </div>
        ) : problems.length === 0 ? (
          <div className="feature-card text-center fade-in-up">
            <h3 className="card-title">No Problems Yet 🎯</h3>
            <p className="card-text">Start by adding your first coding problem!</p>
          </div>
        ) : (
          <div className="table-responsive fade-in-up">
            <table className="table table-custom">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Problem Name</th>
                  <th>Difficulty</th>
                  <th>Topic</th>
                  <th>Points</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id}>
                    <td><strong>{problem.number}</strong></td>
                    <td>{problem.name}</td>
                    <td>{getDifficultyBadge(problem.difficulty)}</td>
                    <td>
                      <span style={{ 
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '15px',
                        fontSize: '0.9rem',
                        fontWeight: 500
                      }}>
                        {problem.topic}
                      </span>
                    </td>
                    <td><strong>{problem.points}</strong></td>
                    <td>{new Date(problem.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-info me-2"
                        onClick={() => handleViewNotes(problem)}
                        style={{ padding: '0.4rem 0.8rem' }}
                        title="View Notes"
                      >
                        <FaStickyNote />
                      </button>
                      <button 
                        className="btn btn-sm btn-primary-custom me-2"
                        onClick={() => handleEdit(problem)}
                        style={{ padding: '0.4rem 0.8rem' }}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn btn-sm"
                        onClick={() => handleDelete(problem.id)}
                        style={{ 
                          background: 'linear-gradient(135deg, #f56565, #e53e3e)',
                          color: 'white',
                          border: 'none',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '8px'
                        }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '20px', border: 'none' }}>
              <div className="modal-header" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '20px 20px 0 0'
              }}>
                <h5 className="modal-title">
                  {editingProblem ? 'Edit Problem' : 'Add New Problem'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label-custom">Problem Number</label>
                    <input
                      type="text"
                      name="number"
                      className="form-control form-control-custom"
                      placeholder="e.g., LC-1"
                      value={formData.number}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label-custom">Problem Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control form-control-custom"
                      placeholder="e.g., Two Sum"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label-custom">Difficulty</label>
                    <select
                      name="difficulty"
                      className="form-control form-control-custom"
                      value={formData.difficulty}
                      onChange={handleChange}
                      required
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label-custom">Topic</label>
                    <input
                      type="text"
                      name="topic"
                      className="form-control form-control-custom"
                      placeholder="e.g., Arrays, Dynamic Programming"
                      value={formData.topic}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label-custom">Summary (Optional)</label>
                    <textarea
                      name="summary"
                      className="form-control form-control-custom"
                      rows="3"
                      placeholder="Brief notes about the problem..."
                      value={formData.summary}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary-custom flex-grow-1">
                      {editingProblem ? 'Update Problem' : 'Add Problem'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary-custom"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggest Problems Modal */}
      {showSuggestModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowSuggestModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '20px', border: 'none' }}>
              <div className="modal-header" style={{ 
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                borderRadius: '20px 20px 0 0'
              }}>
                <h5 className="modal-title">
                  <FaMagic className="me-2" />
                  AI Problem Suggestions
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowSuggestModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '2rem' }}>
                <p className="text-muted mb-3">
                  Get personalized problem recommendations based on your progress!
                </p>

                <div className="mb-4">
                  <label className="form-label fw-bold">Would you like to practice a specific topic?</label>
                  <select
                    className="form-select"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  >
                    {topics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                  <small className="text-muted">
                    Select "None" for general recommendations based on your progress
                  </small>
                </div>

                <button 
                  className="btn btn-success w-100 mb-3"
                  onClick={handleSuggestProblems}
                  disabled={loadingRecommendations}
                >
                  {loadingRecommendations ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Getting Recommendations...
                    </>
                  ) : (
                    <>
                      <FaLightbulb className="me-2" />
                      Get Recommendations
                    </>
                  )}
                </button>

                {/* Recommendations Display */}
                {recommendations.length > 0 && (
                  <div>
                    <h6 className="fw-bold mb-3">Recommended Problems:</h6>
                    <div className="list-group">
                      {recommendations.map((rec, index) => (
                        <div key={index} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{rec.problem_name}</h6>
                              <div className="mb-2">
                                <span className={`badge ${
                                  rec.difficulty === 'Easy' ? 'bg-success' : 
                                  rec.difficulty === 'Medium' ? 'bg-warning' : 
                                  'bg-danger'
                                } me-2`}>
                                  {rec.difficulty}
                                </span>
                                <span className="badge bg-secondary">{rec.topic}</span>
                              </div>
                              <p className="mb-0 text-muted small">{rec.reason}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.length === 0 && !loadingRecommendations && (
                  <div className="text-center text-muted py-3">
                    <FaLightbulb size={40} className="mb-2 opacity-50" />
                    <p>Click "Get Recommendations" to see suggested problems</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Notes Modal */}
      {showNotesModal && selectedProblem && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowNotesModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <FaStickyNote className="me-2" />
                  Notes: {selectedProblem.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowNotesModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <span className="badge bg-secondary me-2">{selectedProblem.difficulty}</span>
                  <span className="badge bg-primary">{selectedProblem.topic}</span>
                </div>

                {selectedProblem.summary && (
                  <div className="mb-3">
                    <h6 className="fw-bold">Summary:</h6>
                    <p className="text-muted">{selectedProblem.summary}</p>
                  </div>
                )}

                {selectedProblem.notes ? (
                  <div>
                    <h6 className="fw-bold">Notes:</h6>
                    <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {selectedProblem.notes}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    <FaStickyNote size={40} className="mb-2 opacity-50" />
                    <p>No notes added yet. Click "Edit" to add notes.</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowNotesModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowNotesModal(false);
                    handleEdit(selectedProblem);
                  }}
                >
                  <FaEdit className="me-2" />
                  Edit Problem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}