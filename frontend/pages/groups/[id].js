import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { getApiUrl } from '../../utils/api';
import { FaCopy, FaDoorOpen, FaUsers, FaCrown, FaCalendarAlt } from 'react-icons/fa';

export default function GroupDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/login');
      return;
    }
    fetchGroupDetails(userId);
    fetchMembers(userId);
  }, [router.isReady]);

  const fetchGroupDetails = async (userId) => {
    try {
      setLoadingGroup(true);
      setErrorMessage('');
      const response = await axios.get(getApiUrl(`/api/groups/${id}?user_id=${userId}`));
      const groupData = response.data?.group || response.data;
      setGroup(groupData);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to load group details.';
      setErrorMessage(message);
    } finally {
      setLoadingGroup(false);
    }
  };

  const fetchMembers = async (userId) => {
    try {
      setLoadingMembers(true);
      const response = await axios.get(getApiUrl(`/api/groups/${id}/members?user_id=${userId}`));
      const membersData = response.data?.members || response.data || [];
      setMembers(membersData);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to load members.';
      setErrorMessage(message);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!group?.invite_code) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(group.invite_code);
        setCopyStatus('Copied');
        setTimeout(() => setCopyStatus(''), 2000);
      } else {
        window.prompt('Copy invite code:', group.invite_code);
      }
    } catch (error) {
      setCopyStatus('');
    }
  };

  const handleLeaveGroup = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    if (!confirm('Are you sure you want to leave this group?')) return;

    setLeaveLoading(true);
    setErrorMessage('');
    try {
      await axios.delete(getApiUrl(`/api/groups/${id}/leave`), {
        data: { user_id: userId }
      });
      router.push('/groups');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to leave group.';
      setErrorMessage(message);
    } finally {
      setLeaveLoading(false);
    }
  };

  const formatRole = (role) => {
    if (!role) return 'Member';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div className="container-custom">
        {errorMessage && (
          <div className="alert alert-danger fade-in-up">{errorMessage}</div>
        )}

        {loadingGroup ? (
          <div className="text-center">
            <div className="spinner-custom"></div>
          </div>
        ) : group ? (
          <>
            <div className="page-header fade-in-up">
              <h1 className="page-title">{group.name}</h1>
              <p className="page-subtitle">{group.description || 'No description provided.'}</p>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-lg-7">
                <div className="feature-card h-100">
                  <h3 className="card-title">Group Details</h3>
                  <div className="d-flex flex-wrap gap-4 mt-3">
                    <div>
                      <strong>Role:</strong> {formatRole(group.user_role)}
                    </div>
                    <div>
                      <strong>Members:</strong> {group.member_count ?? 0}
                    </div>
                    <div>
                      <strong>Max Members:</strong> {group.max_members}
                    </div>
                    <div>
                      <strong>Created:</strong>{' '}
                      {group.created_at ? new Date(group.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div className="mt-4">
                    {group.invite_code ? (
                      <div className="d-flex align-items-center justify-content-between alert alert-success">
                        <div>
                          <strong>Invite Code:</strong> {group.invite_code}
                          <div className="small text-muted">Share this with friends.</div>
                        </div>
                        <button className="btn btn-sm btn-light" onClick={handleCopyInvite}>
                          <FaCopy className="me-2" />
                          {copyStatus || 'Copy'}
                        </button>
                      </div>
                    ) : (
                      <div className="alert alert-secondary">
                        Invite code is available to admins only.
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2 flex-wrap mt-4">
                    {group.user_role === 'admin' && (
                      <button
                        className="btn btn-primary-custom"
                        onClick={() => router.push(`/groups/${id}/contests/create`)}
                      >
                        <FaCrown className="me-2" />
                        Create Contest
                      </button>
                    )}
                    <button
                      className="btn btn-secondary-custom"
                      onClick={() => router.push(`/groups/${id}/contests`)}
                    >
                      <FaCalendarAlt className="me-2" />
                      View Contests
                    </button>
                    <button
                      className="btn"
                      onClick={handleLeaveGroup}
                      disabled={leaveLoading}
                      style={{
                        background: 'linear-gradient(135deg, #f56565, #e53e3e)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        padding: '0.75rem 2rem',
                        fontWeight: 600
                      }}
                    >
                      {leaveLoading ? 'Leaving...' : (
                        <>
                          <FaDoorOpen className="me-2" />
                          Leave Group
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="feature-card h-100">
                  <h3 className="card-title">
                    <FaUsers className="me-2" />
                    Members
                  </h3>

                  {loadingMembers ? (
                    <div className="text-center">
                      <div className="spinner-custom"></div>
                    </div>
                  ) : members.length === 0 ? (
                    <p className="card-text">No members found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-custom">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member) => (
                            <tr key={`${member.user_id}-${member.joined_at}`}>
                              <td>{member.name || `User ${member.user_id}`}</td>
                              <td>{formatRole(member.role)}</td>
                              <td>
                                {member.joined_at
                                  ? new Date(member.joined_at).toLocaleDateString()
                                  : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="feature-card fade-in-up">
              <h3 className="card-title">Contests</h3>
              <p className="card-text">
                Upcoming contests will appear here once enabled for your group.
              </p>
              <button
                className="btn btn-primary-custom"
                onClick={() => router.push(`/groups/${id}/contests`)}
              >
                View Contests
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
