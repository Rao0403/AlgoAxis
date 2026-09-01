import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import {
  FaEdit,
  FaFilter,
  FaLightbulb,
  FaMagic,
  FaPlus,
  FaSave,
  FaSearch,
  FaStickyNote,
  FaTrash
} from 'react-icons/fa';

const PROBLEM_STATUSES = ['To-Do', 'In Progress', 'Solved', 'Revisit'];
const COMPLETED_STATUSES = new Set(['Solved', 'Revisit']);

const EMPTY_PROBLEM_FORM = {
  number: '',
  name: '',
  difficulty: 'Easy',
  topic: '',
  status: 'Solved',
  summary: '',
  notes: ''
};

const EMPTY_DETAILED_NOTES = {
  approach: '',
  solution_code: '',
  time_complexity: '',
  space_complexity: '',
  key_insights: '',
  mistakes_made: '',
  related_problems: ''
};

const NOTE_FIELDS = Object.keys(EMPTY_DETAILED_NOTES);

const TOPICS = [
  'None',
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Binary Search',
  'Sorting',
  'Hash Tables',
  'Stacks & Queues',
  'Heaps',
  'Bit Manipulation',
  'Math',
  'Recursion',
  'Sliding Window',
  'Two Pointers'
];

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
  const [formData, setFormData] = useState({ ...EMPTY_PROBLEM_FORM });
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    difficulty: 'All',
    topic: 'All',
    sortBy: 'created_at',
    sortDir: 'desc'
  });
  const [detailedNotes, setDetailedNotes] = useState({ ...EMPTY_DETAILED_NOTES });
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesMessage, setNotesMessage] = useState('');
  const [notesError, setNotesError] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/login');
    } else {
      fetchProblems();
    }
  }, [router]);

  const fetchProblems = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await axios.get(getApiUrl(`/api/problems?user_id=${userId}`));
      setProblems(Array.isArray(response.data) ? response.data : []);
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

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id');

    try {
      if (editingProblem) {
        await axios.put(getApiUrl(`/api/problems/${editingProblem.id}`), {
          ...formData,
          user_id: userId
        });
      } else {
        await axios.post(getApiUrl('/api/problems'), {
          ...formData,
          user_id: userId
        });
      }

      setFormData({ ...EMPTY_PROBLEM_FORM });
      setEditingProblem(null);
      setShowModal(false);
      fetchProblems();
    } catch (error) {
      console.error('Error saving problem:', error);
      alert(error.response?.data?.error || 'Failed to save problem. Please try again.');
    }
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setFormData({
      number: problem.number || '',
      name: problem.name || '',
      difficulty: problem.difficulty || 'Easy',
      topic: problem.topic || '',
      status: problem.status || 'Solved',
      summary: problem.summary || '',
      notes: problem.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (problemId) => {
    if (!confirm('Delete this problem from your tracker?')) return;

    try {
      const userId = localStorage.getItem('user_id');
      await axios.delete(getApiUrl(`/api/problems/${problemId}?user_id=${userId}`));
      fetchProblems();
    } catch (error) {
      console.error('Error deleting problem:', error);
      alert(error.response?.data?.error || 'Failed to delete problem. Please try again.');
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
      const nextRecommendations = response.data.recommendations || [];

      setRecommendations(nextRecommendations);

      if (nextRecommendations.length === 0 && response.data.raw_text) {
        console.log('Raw recommendations:', response.data.raw_text);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert(error.response?.data?.error || 'Failed to get recommendations.');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleViewNotes = async (problem) => {
    const userId = localStorage.getItem('user_id');
    setSelectedProblem(problem);
    setDetailedNotes({ ...EMPTY_DETAILED_NOTES });
    setNotesMessage('');
    setNotesError('');
    setNotesLoading(true);
    setShowNotesModal(true);

    try {
      const response = await axios.get(getApiUrl(`/api/notes/${problem.id}?user_id=${userId}`));
      setDetailedNotes({
        ...EMPTY_DETAILED_NOTES,
        ...(response.data || {})
      });
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotesError(error.response?.data?.error || 'Failed to load detailed notes.');
    } finally {
      setNotesLoading(false);
    }
  };

  const handleDetailedNotesChange = (e) => {
    setDetailedNotes({
      ...detailedNotes,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveDetailedNotes = async (e) => {
    e.preventDefault();
    if (!selectedProblem) return;

    const userId = localStorage.getItem('user_id');
    setNotesSaving(true);
    setNotesMessage('');
    setNotesError('');

    try {
      await axios.post(getApiUrl('/api/notes'), {
        ...detailedNotes,
        problem_id: selectedProblem.id,
        user_id: userId
      });
      setNotesMessage('Notes saved.');
    } catch (error) {
      console.error('Error saving notes:', error);
      setNotesError(error.response?.data?.error || 'Failed to save detailed notes.');
    } finally {
      setNotesSaving(false);
    }
  };

  const handleDeleteDetailedNotes = async () => {
    if (!selectedProblem || !confirm('Delete detailed notes for this problem?')) return;

    const userId = localStorage.getItem('user_id');
    setNotesSaving(true);
    setNotesMessage('');
    setNotesError('');

    try {
      await axios.delete(getApiUrl(`/api/notes/${selectedProblem.id}?user_id=${userId}`));
      setDetailedNotes({ ...EMPTY_DETAILED_NOTES });
      setNotesMessage('Notes deleted.');
    } catch (error) {
      console.error('Error deleting notes:', error);
      setNotesError(error.response?.data?.error || 'Failed to delete detailed notes.');
    } finally {
      setNotesSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingProblem(null);
    setFormData({ ...EMPTY_PROBLEM_FORM });
    setShowModal(true);
  };

  const getDifficultyBadge = (difficulty) => {
    const classes = {
      Easy: 'badge-easy',
      Medium: 'badge-medium',
      Hard: 'badge-hard'
    };
    return <span className={`badge ${classes[difficulty] || 'bg-secondary'}`}>{difficulty}</span>;
  };

  const getStatusBadge = (status = 'Solved') => {
    const classes = {
      'To-Do': 'status-todo',
      'In Progress': 'status-progress',
      Solved: 'status-solved',
      Revisit: 'status-revisit'
    };
    return <span className={`status-badge ${classes[status] || 'status-solved'}`}>{status}</span>;
  };

  const topicOptions = useMemo(() => {
    const fromProblems = problems
      .map((problem) => problem.topic)
      .filter(Boolean);
    return ['All', ...Array.from(new Set(fromProblems)).sort()];
  }, [problems]);

  const summary = useMemo(() => {
    return problems.reduce(
      (acc, problem) => {
        const status = problem.status || 'Solved';
        acc.tracked += 1;
        acc.statusCounts[status] = (acc.statusCounts[status] || 0) + 1;
        if (COMPLETED_STATUSES.has(status)) {
          acc.completed += 1;
          acc.points += Number(problem.points) || 0;
        }
        return acc;
      },
      {
        tracked: 0,
        completed: 0,
        points: 0,
        statusCounts: {
          'To-Do': 0,
          'In Progress': 0,
          Solved: 0,
          Revisit: 0
        }
      }
    );
  }, [problems]);

  const filteredProblems = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    const filtered = problems.filter((problem) => {
      const status = problem.status || 'Solved';
      const matchesSearch = !query || [
        problem.number,
        problem.name,
        problem.topic,
        problem.summary
      ].some((value) => String(value || '').toLowerCase().includes(query));

      return (
        matchesSearch &&
        (filters.status === 'All' || status === filters.status) &&
        (filters.difficulty === 'All' || problem.difficulty === filters.difficulty) &&
        (filters.topic === 'All' || problem.topic === filters.topic)
      );
    });

    const direction = filters.sortDir === 'asc' ? 1 : -1;

    return [...filtered].sort((a, b) => {
      if (filters.sortBy === 'created_at' || filters.sortBy === 'updated_at') {
        const first = new Date(a[filters.sortBy] || 0).getTime();
        const second = new Date(b[filters.sortBy] || 0).getTime();
        return (first - second) * direction;
      }

      if (filters.sortBy === 'points') {
        return ((Number(a.points) || 0) - (Number(b.points) || 0)) * direction;
      }

      return String(a[filters.sortBy] || '').localeCompare(
        String(b[filters.sortBy] || ''),
        undefined,
        { numeric: true, sensitivity: 'base' }
      ) * direction;
    });
  }, [filters, problems]);

  const hasDetailedNotes = NOTE_FIELDS.some((field) => String(detailedNotes[field] || '').trim());

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div className="container-custom tracker-page">
        <div className="page-header fade-in-up">
          <h1 className="page-title">Problem Tracker</h1>
          <p className="page-subtitle">Plan, solve, review, and keep your prep organized.</p>
        </div>

        <div className="tracker-action-bar fade-in-up">
          <div>
            <h2 className="tracker-section-title">Problems</h2>
            <p className="tracker-muted">Track work from first attempt through revisit.</p>
          </div>
          <div className="tracker-actions">
            <button className="btn btn-primary-custom" onClick={openAddModal}>
              <FaPlus className="me-2" />
              Add Problem
            </button>
            <button
              className="btn btn-success"
              onClick={() => {
                setSelectedTopic('None');
                setRecommendations([]);
                setShowSuggestModal(true);
              }}
            >
              <FaMagic className="me-2" />
              AI Suggestions
            </button>
          </div>
        </div>

        <div className="tracker-summary-grid fade-in-up">
          <div className="tracker-summary-card">
            <span>Tracked</span>
            <strong>{summary.tracked}</strong>
          </div>
          <div className="tracker-summary-card">
            <span>Solved</span>
            <strong>{summary.completed}</strong>
          </div>
          <div className="tracker-summary-card">
            <span>Points</span>
            <strong>{summary.points}</strong>
          </div>
          <div className="tracker-summary-card">
            <span>In Progress</span>
            <strong>{summary.statusCounts['In Progress']}</strong>
          </div>
          <div className="tracker-summary-card">
            <span>To-Do</span>
            <strong>{summary.statusCounts['To-Do']}</strong>
          </div>
          <div className="tracker-summary-card">
            <span>Revisit</span>
            <strong>{summary.statusCounts.Revisit}</strong>
          </div>
        </div>

        <div className="tracker-filter-panel fade-in-up">
          <div className="tracker-filter-search">
            <FaSearch className="tracker-input-icon" />
            <input
              name="search"
              className="form-control form-control-custom"
              placeholder="Search number, name, topic, or summary"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <select
            name="status"
            className="form-select form-control-custom"
            value={filters.status}
            onChange={handleFilterChange}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            {PROBLEM_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            name="difficulty"
            className="form-select form-control-custom"
            value={filters.difficulty}
            onChange={handleFilterChange}
            aria-label="Filter by difficulty"
          >
            <option value="All">All difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            name="topic"
            className="form-select form-control-custom"
            value={filters.topic}
            onChange={handleFilterChange}
            aria-label="Filter by topic"
          >
            {topicOptions.map((topic) => (
              <option key={topic} value={topic}>
                {topic === 'All' ? 'All topics' : topic}
              </option>
            ))}
          </select>

          <select
            name="sortBy"
            className="form-select form-control-custom"
            value={filters.sortBy}
            onChange={handleFilterChange}
            aria-label="Sort problems"
          >
            <option value="created_at">Date added</option>
            <option value="updated_at">Last updated</option>
            <option value="number">Number</option>
            <option value="name">Name</option>
            <option value="difficulty">Difficulty</option>
            <option value="topic">Topic</option>
            <option value="status">Status</option>
            <option value="points">Points</option>
          </select>

          <button
            type="button"
            className="tracker-icon-button"
            title="Toggle sort direction"
            onClick={() => setFilters({
              ...filters,
              sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc'
            })}
          >
            <FaFilter />
            <span>{filters.sortDir === 'asc' ? 'Asc' : 'Desc'}</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-custom"></div>
          </div>
        ) : problems.length === 0 ? (
          <div className="feature-card text-center fade-in-up">
            <h3 className="card-title">No Problems Yet</h3>
            <p className="card-text">Add your first problem to start tracking progress.</p>
            <button className="btn btn-primary-custom" onClick={openAddModal}>
              <FaPlus className="me-2" />
              Add Problem
            </button>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="feature-card text-center fade-in-up">
            <h3 className="card-title">No Matching Problems</h3>
            <p className="card-text">Adjust the filters or search query.</p>
          </div>
        ) : (
          <div className="table-responsive fade-in-up">
            <table className="table table-custom tracker-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Problem Name</th>
                  <th>Difficulty</th>
                  <th>Topic</th>
                  <th>Status</th>
                  <th>Points</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((problem) => (
                  <tr key={problem.id}>
                    <td><strong>{problem.number}</strong></td>
                    <td>
                      <div className="tracker-problem-name">{problem.name}</div>
                      {problem.summary && (
                        <div className="tracker-problem-summary">{problem.summary}</div>
                      )}
                    </td>
                    <td>{getDifficultyBadge(problem.difficulty)}</td>
                    <td><span className="topic-pill">{problem.topic}</span></td>
                    <td>{getStatusBadge(problem.status)}</td>
                    <td><strong>{problem.points}</strong></td>
                    <td>{new Date(problem.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="tracker-row-actions">
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleViewNotes(problem)}
                          title="Detailed notes"
                        >
                          <FaStickyNote />
                        </button>
                        <button
                          className="btn btn-sm btn-primary-custom"
                          onClick={() => handleEdit(problem)}
                          title="Edit problem"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-sm tracker-danger-button"
                          onClick={() => handleDelete(problem.id)}
                          title="Delete problem"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content tracker-modal">
              <div className="modal-header tracker-modal-header">
                <h5 className="modal-title">
                  {editingProblem ? 'Edit Problem' : 'Add Problem'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label-custom">Problem Number</label>
                      <input
                        type="text"
                        name="number"
                        className="form-control form-control-custom"
                        placeholder="LC-1"
                        value={formData.number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label-custom">Problem Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control form-control-custom"
                        placeholder="Two Sum"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Difficulty</label>
                      <select
                        name="difficulty"
                        className="form-select form-control-custom"
                        value={formData.difficulty}
                        onChange={handleChange}
                        required
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Status</label>
                      <select
                        name="status"
                        className="form-select form-control-custom"
                        value={formData.status}
                        onChange={handleChange}
                        required
                      >
                        {PROBLEM_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Topic</label>
                      <input
                        type="text"
                        name="topic"
                        className="form-control form-control-custom"
                        placeholder="Arrays"
                        list="tracker-topics"
                        value={formData.topic}
                        onChange={handleChange}
                        required
                      />
                      <datalist id="tracker-topics">
                        {TOPICS.filter((topic) => topic !== 'None').map((topic) => (
                          <option key={topic} value={topic} />
                        ))}
                      </datalist>
                    </div>
                    <div className="col-12">
                      <label className="form-label-custom">Summary</label>
                      <textarea
                        name="summary"
                        className="form-control form-control-custom"
                        rows="3"
                        placeholder="Problem pattern, constraint, or key observation"
                        value={formData.summary}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label-custom">Quick Notes</label>
                      <textarea
                        name="notes"
                        className="form-control form-control-custom"
                        rows="4"
                        placeholder="Short reminder, edge case, or implementation note"
                        value={formData.notes}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>

                  <div className="tracker-modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary-custom">
                      {editingProblem ? 'Update Problem' : 'Add Problem'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuggestModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowSuggestModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content tracker-modal">
              <div className="modal-header tracker-modal-header success">
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
              <div className="modal-body">
                <div className="mb-4">
                  <label className="form-label-custom">Topic Focus</label>
                  <select
                    className="form-select form-control-custom"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  >
                    {TOPICS.map((topic) => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
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

                {recommendations.length > 0 ? (
                  <div className="list-group tracker-recommendations">
                    {recommendations.map((rec, index) => (
                      <div key={`${rec.problem_name || 'problem'}-${index}`} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div className="flex-grow-1">
                            <h6 className="mb-2">{rec.problem_name}</h6>
                            <div className="mb-2">
                              {getDifficultyBadge(rec.difficulty)}
                              <span className="topic-pill ms-2">{rec.topic}</span>
                            </div>
                            <p className="mb-0 text-muted small">{rec.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !loadingRecommendations ? (
                  <div className="tracker-empty-state">
                    <FaLightbulb size={32} className="mb-2 opacity-50" />
                    <p>No recommendations yet.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotesModal && selectedProblem && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowNotesModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content tracker-modal">
              <div className="modal-header tracker-modal-header info">
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
              <div className="modal-body">
                <div className="tracker-note-meta">
                  {getDifficultyBadge(selectedProblem.difficulty)}
                  <span className="topic-pill">{selectedProblem.topic}</span>
                  {getStatusBadge(selectedProblem.status)}
                </div>

                {selectedProblem.summary && (
                  <div className="tracker-readonly-note">
                    <h6>Summary</h6>
                    <p>{selectedProblem.summary}</p>
                  </div>
                )}

                {selectedProblem.notes && (
                  <div className="tracker-readonly-note">
                    <h6>Quick Notes</h6>
                    <pre>{selectedProblem.notes}</pre>
                  </div>
                )}

                {notesLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-custom"></div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveDetailedNotes}>
                    {notesMessage && <div className="alert alert-success">{notesMessage}</div>}
                    {notesError && <div className="alert alert-danger">{notesError}</div>}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label-custom">Approach</label>
                        <textarea
                          name="approach"
                          className="form-control form-control-custom"
                          rows="5"
                          value={detailedNotes.approach || ''}
                          onChange={handleDetailedNotesChange}
                        ></textarea>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label-custom">Key Insights</label>
                        <textarea
                          name="key_insights"
                          className="form-control form-control-custom"
                          rows="5"
                          value={detailedNotes.key_insights || ''}
                          onChange={handleDetailedNotesChange}
                        ></textarea>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label-custom">Time Complexity</label>
                        <input
                          name="time_complexity"
                          className="form-control form-control-custom"
                          placeholder="O(n)"
                          value={detailedNotes.time_complexity || ''}
                          onChange={handleDetailedNotesChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label-custom">Space Complexity</label>
                        <input
                          name="space_complexity"
                          className="form-control form-control-custom"
                          placeholder="O(1)"
                          value={detailedNotes.space_complexity || ''}
                          onChange={handleDetailedNotesChange}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label-custom">Solution Code</label>
                        <textarea
                          name="solution_code"
                          className="form-control form-control-custom tracker-code-textarea"
                          rows="8"
                          value={detailedNotes.solution_code || ''}
                          onChange={handleDetailedNotesChange}
                        ></textarea>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label-custom">Mistakes Made</label>
                        <textarea
                          name="mistakes_made"
                          className="form-control form-control-custom"
                          rows="4"
                          value={detailedNotes.mistakes_made || ''}
                          onChange={handleDetailedNotesChange}
                        ></textarea>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label-custom">Related Problems</label>
                        <textarea
                          name="related_problems"
                          className="form-control form-control-custom"
                          rows="4"
                          value={detailedNotes.related_problems || ''}
                          onChange={handleDetailedNotesChange}
                        ></textarea>
                      </div>
                    </div>

                    <div className="tracker-modal-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowNotesModal(false)}>
                        Close
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={handleDeleteDetailedNotes}
                        disabled={notesSaving || !hasDetailedNotes}
                      >
                        <FaTrash className="me-2" />
                        Delete Notes
                      </button>
                      <button type="submit" className="btn btn-primary-custom" disabled={notesSaving}>
                        <FaSave className="me-2" />
                        {notesSaving ? 'Saving...' : 'Save Notes'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
