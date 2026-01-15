import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import { FaUserLock, FaChartLine, FaUsers, FaRobot } from 'react-icons/fa';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(getApiUrl('/api/login'), formData);
      localStorage.setItem('user_id', response.data.user.id);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Visual Background Element */}
      <div className="bg-glow"></div>

      <div className="container-custom">
        <div className="login-grid">
          
          {/* Left Side: Branding & Features */}
          <div className="info-section">
            <div className="brand-badge">AlgoAxis</div>
            <h1 className="hero-text">Master the <span className="text-gradient">Algorithm.</span></h1>
            <p className="hero-subtext">
              Join thousands of developers sharpening their skills for the world's top tech companies.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon"><FaChartLine /></div>
                <div>
                  <h4>Track Progress</h4>
                  <p>Visualize your growth with detailed streak analytics.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><FaRobot /></div>
                <div>
                  <h4>AI Guidance</h4>
                  <p>Get real-time hints when you're stuck on a problem.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><FaUsers /></div>
                <div>
                  <h4>Global Groups</h4>
                  <p>Compete and collaborate with peers worldwide.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="form-section">
            <div className="glass-card">
              <div className="form-header">
                <FaUserLock className="lock-icon" />
                <h2>Sign In</h2>
                <p>Welcome back! Please enter your details.</p>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <form onSubmit={handleSubmit} className="actual-form">
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

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Authenticating..." : "Sign In to Dashboard"}
                </button>
              </form>

              <p className="footer-text">
                New to AlgoAxis? <Link href="/register">Create an account</Link>
              </p>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .login-page {
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
          top: -10%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
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

        .login-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
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
          background: #1f2937;
          padding: 10px;
          border-radius: 8px;
          color: #818cf8;
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
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 3rem;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .lock-icon {
          font-size: 2rem;
          color: #818cf8;
          margin-bottom: 1rem;
        }

        .input-group {
          margin-bottom: 1.5rem;
        }

        .input-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: #9ca3af;
          margin-bottom: 0.5rem;
        }

        /* Update your input-group input styles */
        .input-group input {
          width: 100%;
          background: #111827; /* Darker background */
          border: 1px solid #374151; /* Subtle gray border */
          border-radius: 12px;
          padding: 14px 16px;
          color: #ffffff; /* White text */
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .input-group input:focus {
          outline: none;
          border-color: #6366f1; /* Purple/Blue border on focus */
          background: #0f172a;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
        }

        /* Adjust the placeholder color to be readable but dim */
        .input-group input::placeholder {
          color: #6b7280;
        }

        .login-btn {
          width: 100%;
          background: #6366f1;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }

        .login-btn:hover {
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
          .login-grid { grid-template-columns: 1fr; gap: 3rem; }
          .info-section { text-align: center; }
          .hero-subtext { margin-left: auto; margin-right: auto; }
          .feature-item { text-align: left; }
        }
      `}</style>
    </div>
  );
}