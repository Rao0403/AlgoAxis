import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import { FaUsers, FaPlus, FaSignInAlt, FaCopy } from 'react-icons/fa';

export default function Groups() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [joinForm, setJoinForm] = useState({ invite_code: '' });

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/login');
    } else {
      fetchGroups();
    }
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const userId = localStorage.getItem('user_id');
      const response = await axios.get(getApiUrl(`/api/groups/my?user_id=${userId}`));
      const groupsData = response.data?.groups || response.data || [];
      setGroups(groupsData);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to load groups.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChange = (e) => {
    setCreateForm({
      ...createForm,
      [e.target.name]: e.target.value
    });
  };

  const handleJoinChange = (e) => {
    setJoinForm({
      ...joinForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    setCreateLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setInviteCode('');

    try {
      const response = await axios.post(getApiUrl('/api/groups/create'), {
        user_id: userId,
        name: createForm.name,
        description: createForm.description
      });

      const createdGroup = response.data?.group;
      if (createdGroup?.invite_code) {
        setInviteCode(createdGroup.invite_code);
      }
      setSuccessMessage('Group created successfully.');
      setCreateForm({ name: '', description: '' });
      await fetchGroups();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create group.';
      setErrorMessage(message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    setJoinLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await axios.post(getApiUrl('/api/groups/join'), {
        user_id: userId,
        invite_code: joinForm.invite_code
      });
      setSuccessMessage('Joined group successfully.');
      setJoinForm({ invite_code: '' });
      await fetchGroups();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to join group.';
      setErrorMessage(message);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteCode) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteCode);
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2000);
      } else {
        window.prompt('Copy invite code:', inviteCode);
      }
    } catch (error) {
      setInviteCopied(false);
    }
  };

  const formatRole = (role) => {
    if (!role) return 'Member';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const isGroupLimitReached = groups.length >= 2;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div className="container-custom">
        <div className="page-header fade-in-up">
          <h1 className="page-title">Groups</h1>
          <p className="page-subtitle">Create or join groups to practice together</p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger fade-in-up">{errorMessage}</div>
        )}

        {successMessage && (
          <div className="alert alert-success fade-in-up">{successMessage}</div>
        )}

        {inviteCode && (
          <div className="alert alert-success d-flex align-items-center justify-content-between fade-in-up">
            <div>
              <strong>Invite Code:</strong> {inviteCode}
              <div className="small text-muted">Share this with friends to join your group.</div>
            </div>
            <button className="btn btn-sm btn-light" onClick={handleCopyInvite}>
              <FaCopy className="me-2" />
              {inviteCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        {isGroupLimitReached && (
          <div className="alert alert-warning fade-in-up">
            You are already in 2 groups. Leave a group to create or join another.
          </div>
        )}

        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="feature-card h-100">
              <h3 className="card-title">
                <FaPlus className="me-2" />
                Create Group
              </h3>
              <p className="card-text">Start a new group and invite your friends.</p>
              <form onSubmit={handleCreateGroup}>
                <div className="mb-3">
                  <label className="form-label-custom">Group Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-custom"
                    value={createForm.name}
                    onChange={handleCreateChange}
                    placeholder="e.g., Alpha Squad"
                    required
                    disabled={isGroupLimitReached || createLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Description (Optional)</label>
                  <textarea
                    name="description"
                    className="form-control form-control-custom"
                    rows="3"
                    value={createForm.description}
                    onChange={handleCreateChange}
                    placeholder="What is this group about?"
                    disabled={isGroupLimitReached || createLoading}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary-custom"
                  disabled={isGroupLimitReached || createLoading}
                >
                  {createLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Group'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="col-md-6">
            <div className="feature-card h-100">
              <h3 className="card-title">
                <FaSignInAlt className="me-2" />
                Join Group
              </h3>
              <p className="card-text">Have an invite code? Join a group in seconds.</p>
              <form onSubmit={handleJoinGroup}>
                <div className="mb-3">
                  <label className="form-label-custom">Invite Code</label>
                  <input
                    type="text"
                    name="invite_code"
                    className="form-control form-control-custom"
                    value={joinForm.invite_code}
                    onChange={handleJoinChange}
                    placeholder="Enter invite code"
                    required
                    disabled={isGroupLimitReached || joinLoading}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary-custom"
                  disabled={isGroupLimitReached || joinLoading}
                >
                  {joinLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Joining...
                    </>
                  ) : (
                    'Join Group'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="feature-card fade-in-up">
          <h3 className="card-title">
            <FaUsers className="me-2" />
            Your Groups
          </h3>

          {loading ? (
            <div className="text-center">
              <div className="spinner-custom"></div>
            </div>
          ) : groups.length === 0 ? (
            <p className="card-text">You are not part of any groups yet.</p>
          ) : (
            <div className="row g-4 mt-2">
              {groups.map((group) => (
                <div key={group.id} className="col-md-6 col-lg-4">
                  <div className="feature-card h-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h3 className="card-title mb-0">{group.name}</h3>
                      <span className="badge bg-secondary">{formatRole(group.role)}</span>
                    </div>
                    <p className="card-text">
                      {group.description || 'No description provided.'}
                    </p>
                    <div className="d-flex flex-wrap gap-3 mb-3">
                      <span>
                        <strong>Members:</strong> {group.member_count ?? 0}
                      </span>
                      {group.max_members ? (
                        <span>
                          <strong>Max:</strong> {group.max_members}
                        </span>
                      ) : null}
                    </div>
                    <button
                      className="btn btn-primary-custom"
                      onClick={() => router.push(`/groups/${group.id}`)}
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
