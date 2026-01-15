import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import { FaUserPlus, FaClipboardList, FaChartLine, FaUsers } from 'react-icons/fa';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(getApiUrl('/api/register'), {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      const loginRes = await axios.post(getApiUrl('/api/login'), {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('user_id', loginRes.data.user.id);
      localStorage.setItem('user_name', loginRes.data.user.name);
      localStorage.setItem('user_email', loginRes.data.user.email);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-glow"></div>

      <div className="container-custom">
        <div className="auth-grid">
          
          {/* Left Side: Value Proposition */}
          <div className="info-section">
            <div className="brand-badge">AlgoAxis</div>
            <h1 className="hero-text">Scale your <span className="text-gradient">Career.</span></h1>
            <p className="hero-subtext">
              Build your personalized interview prep workspace and start solving high-impact problems today.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon"><FaClipboardList /></div>
                <div>
                  <h4>Problem Tracker</h4>
                  <p>Stay organized with custom tags and private notes.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><FaChartLine /></div>
                <div>
                  <h4>Progress Analytics</h4>
                  <p>Visualize your growth with clean, actionable charts.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><FaUsers /></div>
                <div>
                  <h4>Group Prep</h4>
                  <p>Collaborate and stay accountable with coding peers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Register Form */}
          <div className="form-section">
            <div className="glass-card">
              <div className="form-header">
                <FaUserPlus className="auth-icon" />
                <h2>Create Account</h2>
                <p>Join AlgoAxis and start your journey.</p>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <form onSubmit={handleSubmit} className="actual-form">
                <div className="input-row">
                    <div className="input-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    </div>
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-row-flex">
                    <div className="input-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    </div>

                    <div className="input-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    </div>
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? "Creating Account..." : "Get Started for Free"}
                </button>
              </form>

              <p className="footer-text">
                Already have an account? <Link href="/login">Sign in here</Link>
              </p>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          background-color: #030712;
          color: #f3f4f6;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .bg-glow {
          position: absolute;
          bottom: -10%;
          left: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
          z-index: 0;
        }

        .container-custom {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .auth-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 4rem;
          align-items: center;
        }

        .brand-badge {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 20px;
          color: #818cf8;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .hero-text {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .text-gradient {
          background: linear-gradient(to right, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtext {
          font-size: 1.1rem;
          color: #9ca3af;
          margin-bottom: 3rem;
          max-width: 450px;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .feature-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .feature-icon {
          background: #111827;
          padding: 12px;
          border-radius: 12px;
          color: #818cf8;
          border: 1px solid #1f2937;
        }

        .feature-item h4 {
          margin: 0;
          font-size: 1rem;
          color: #f3f4f6;
        }

        .feature-item p {
          margin: 0;
          font-size: 0.9rem;
          color: #9ca3af;
        }

        .glass-card {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 2.5rem;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-icon {
          font-size: 2rem;
          color: #818cf8;
          margin-bottom: 1rem;
        }

        .input-group {
          margin-bottom: 1.25rem;
          flex: 1;
        }

        .input-row-flex {
            display: flex;
            gap: 1rem;
        }

        .input-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: #9ca3af;
          margin-bottom: 0.5rem;
        }

        .input-group input {
          width: 100%;
          background: #0b0f1a;
          border: 1px solid #1f2937;
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          transition: all 0.2s;
        }

        .input-group input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .auth-btn {
          width: 100%;
          background: #6366f1;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s;
        }

        .auth-btn:hover {
          background: #4f46e5;
          transform: translateY(-1px);
        }

        .error-msg {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          text-align: center;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .footer-text {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: #9ca3af;
        }

        .footer-text a {
          color: #818cf8;
          text-decoration: none;
          font-weight: 600;
        }

        @media (max-width: 992px) {
          .auth-grid { grid-template-columns: 1fr; gap: 3rem; }
          .info-section { text-align: center; }
          .hero-subtext { margin-left: auto; margin-right: auto; }
          .feature-item { text-align: left; }
          .input-row-flex { flex-direction: column; gap: 0; }
        }
      `}</style>
    </div>
  );
}