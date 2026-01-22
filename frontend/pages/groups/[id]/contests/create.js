import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../../../components/Navbar';
import axios from 'axios';
import { getApiUrl } from '../../../../utils/api';

const emptyProblem = () => ({
  leetcode_number: '',
  title: '',
  difficulty: 'Easy',
  prompt: '',
  function_signature: '',
  base_points: '',
  testcases_json: '[\n  {\n    "input": [],\n    "expected": null,\n    "is_sample": true\n  }\n]'
});

export default function CreateContest() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    max_submissions_per_problem: 3
  });
  const [problems, setProblems] = useState([emptyProblem()]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/login');
    }
  }, [router.isReady]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateProblem = (index, field, value) => {
    setProblems((prev) => prev.map((problem, idx) => (
      idx === index ? { ...problem, [field]: value } : problem
    )));
  };

  const addProblem = () => {
    if (problems.length >= 5) return;
    setProblems((prev) => [...prev, emptyProblem()]);
  };

  const removeProblem = (index) => {
    if (problems.length === 1) return;
    setProblems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const parseTestcases = (raw) => {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Testcases must be a JSON array.');
    }
    return parsed.map((item) => ({
      input: item.input,
      expected: item.expected,
      is_sample: Boolean(item.is_sample)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setErrorMessage('Login required.');
      return;
    }

    try {
      setLoading(true);

      const payloadProblems = problems.map((problem) => ({
        leetcode_number: problem.leetcode_number || null,
        title: problem.title.trim(),
        difficulty: problem.difficulty,
        prompt: problem.prompt.trim(),
        function_signature: problem.function_signature.trim(),
        base_points: problem.base_points ? Number(problem.base_points) : null,
        testcases: parseTestcases(problem.testcases_json)
      }));

      await axios.post(getApiUrl(`/api/groups/${id}/contests`), {
        user_id: userId,
        ...formData,
        problems: payloadProblems
      });

      router.push(`/groups/${id}/contests`);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to create contest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div className="container-custom">
        <div className="page-header fade-in-up">
          <h1 className="page-title">Create Contest</h1>
          <p className="page-subtitle">Set up contest details and problems</p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger fade-in-up">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="feature-card mb-4">
            <h3 className="card-title">Contest Details</h3>
            <div className="mb-3">
              <label className="form-label-custom">Name</label>
              <input
                name="name"
                className="form-control form-control-custom"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label-custom">Description</label>
              <textarea
                name="description"
                className="form-control form-control-custom"
                rows="3"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label-custom">Start Time</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  className="form-control form-control-custom"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">End Time</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  className="form-control form-control-custom"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="form-label-custom">Max Submissions Per Problem</label>
              <input
                type="number"
                name="max_submissions_per_problem"
                className="form-control form-control-custom"
                min="1"
                max="5"
                value={formData.max_submissions_per_problem}
                onChange={handleChange}
              />
            </div>
          </div>

          {problems.map((problem, index) => (
            <div key={index} className="feature-card mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="card-title mb-0">Problem {index + 1}</h3>
                {problems.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary-custom"
                    onClick={() => removeProblem(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label-custom">LeetCode Number (optional)</label>
                <input
                  className="form-control form-control-custom"
                  value={problem.leetcode_number}
                  onChange={(e) => updateProblem(index, 'leetcode_number', e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Title</label>
                <input
                  className="form-control form-control-custom"
                  value={problem.title}
                  onChange={(e) => updateProblem(index, 'title', e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Difficulty</label>
                <select
                  className="form-control form-control-custom"
                  value={problem.difficulty}
                  onChange={(e) => updateProblem(index, 'difficulty', e.target.value)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Function Signature</label>
                <input
                  className="form-control form-control-custom"
                  value={problem.function_signature}
                  onChange={(e) => updateProblem(index, 'function_signature', e.target.value)}
                  placeholder="twoSum(nums, target) or int[] twoSum(int[] nums, int target)"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Prompt</label>
                <textarea
                  className="form-control form-control-custom"
                  rows="4"
                  value={problem.prompt}
                  onChange={(e) => updateProblem(index, 'prompt', e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Base Points (optional)</label>
                <input
                  type="number"
                  className="form-control form-control-custom"
                  value={problem.base_points}
                  onChange={(e) => updateProblem(index, 'base_points', e.target.value)}
                  placeholder="Defaults to difficulty-based points"
                />
              </div>

              <div className="mb-3">
                <label className="form-label-custom">Testcases (JSON array)</label>
                <textarea
                  className="form-control form-control-custom"
                  rows="6"
                  value={problem.testcases_json}
                  onChange={(e) => updateProblem(index, 'testcases_json', e.target.value)}
                ></textarea>
              </div>
            </div>
          ))}

          <div className="d-flex gap-2 flex-wrap mb-5">
            <button
              type="button"
              className="btn btn-secondary-custom"
              onClick={addProblem}
              disabled={problems.length >= 5}
            >
              Add Problem
            </button>
            <button
              type="submit"
              className="btn btn-primary-custom"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Contest'}
            </button>
            <button
              type="button"
              className="btn btn-secondary-custom"
              onClick={() => router.push(`/groups/${id}/contests`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
