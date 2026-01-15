import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { getApiUrl } from '../utils/api';
import { FaFileUpload, FaFilePdf, FaDownload, FaMagic } from 'react-icons/fa';

export default function Upload() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/login');
    } else {
      fetchResumes();
    }
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');
      const response = await axios.get(getApiUrl(`/api/resumes?user_id=${userId}`));
      setResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setAnalysis('');
      setShowAnalysis(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      const userId = localStorage.getItem('user_id');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('user_id', userId);

      await axios.post(getApiUrl('/api/upload-resume'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadSuccess(true);
      setSelectedFile(null);
      document.getElementById('fileInput').value = '';
      fetchResumes();

      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume. Please check your AWS configuration and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setAnalyzing(true);
    setAnalysis('');
    setCandidateName('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(getApiUrl('/api/analyze-resume'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAnalysis(response.data.analysis);
      setCandidateName(response.data.candidate_name || '');
      setShowAnalysis(true);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to analyze resume. Please make sure Gemini API key is configured.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      
      <div className="container mt-5">
        <div className="text-center mb-5">
          <h1 style={{ color: 'white', fontWeight: 'bold' }}>Resume Upload & Analysis 📄</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)' }}>Upload your resume and get AI-powered feedback</p>
        </div>

        {/* Upload Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-body p-4">
                <h3 className="mb-3">Upload & Analyze Resume</h3>
                <p className="text-muted mb-4">
                  Upload your resume in PDF format (max 5MB). Get instant AI analysis or store it securely on AWS S3.
                </p>

                {uploadSuccess && (
                  <div className="alert alert-success mb-4">
                    ✅ Resume uploaded successfully to AWS S3!
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label fw-bold">Select PDF Resume</label>
                  <input
                    type="file"
                    id="fileInput"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="form-control"
                  />
                  {selectedFile && (
                    <div className="mt-2">
                      <span style={{ color: '#667eea', fontWeight: 600 }}>
                        📄 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2 flex-wrap">
                  <button 
                    className="btn btn-success"
                    onClick={handleAnalyze}
                    disabled={!selectedFile || analyzing}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <FaMagic className="me-2" />
                    {analyzing ? 'Analyzing with AI...' : 'Analyze with Gemini AI'}
                  </button>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    style={{ pointerEvents: 'auto' }}
                  >
                    {uploading ? 'Uploading...' : 'Upload to AWS S3'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Results */}
        {showAnalysis && analysis && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow border-success">
                <div className="card-header bg-success text-white">
                  <h4 className="mb-0">
                    <FaMagic className="me-2" />
                    AI Resume Analysis {candidateName && candidateName !== 'the candidate' && `for ${candidateName}`}
                  </h4>
                </div>
                <div className="card-body p-4">
                  <div style={{ 
                    whiteSpace: 'pre-wrap', 
                    lineHeight: '1.8',
                    fontSize: '1rem'
                  }}>
                    {analysis}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Resumes List */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-body p-4">
                <h3 className="mb-3">Your Uploaded Resumes</h3>
                
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-5">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                    <p className="text-muted">No resumes uploaded yet</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Filename</th>
                          <th>Upload Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumes.map((resume) => (
                          <tr key={resume.id}>
                            <td>
                              <FaFilePdf style={{ color: '#f56565', marginRight: '0.5rem' }} />
                              <strong>{resume.filename}</strong>
                            </td>
                            <td>{new Date(resume.uploaded_at).toLocaleString()}</td>
                            <td>
                              <a 
                                href={resume.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-primary"
                              >
                                <FaDownload style={{ marginRight: '0.3rem' }} />
                                Download
                              </a>
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
        </div>

        {/* Info Cards */}
        <div className="row mb-5">
          <div className="col-md-4 mb-3">
            <div className="card shadow h-100">
              <div className="card-body">
                <h5 className="card-title">🤖 AI-Powered Analysis</h5>
                <p className="card-text">
                  Get instant feedback on your resume using Google's Gemini AI:
                </p>
                <ul className="text-muted small">
                  <li>Overall impression & strengths</li>
                  <li>Areas for improvement</li>
                  <li>Technical skills assessment</li>
                  <li>Format & readability check</li>
                  <li>Actionable recommendations</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow h-100">
              <div className="card-body">
                <h5 className="card-title">☁️ Secure Cloud Storage</h5>
                <p className="card-text">
                  Your resumes are stored securely on Amazon S3:
                </p>
                <ul className="text-muted small">
                  <li>99.999999999% durability</li>
                  <li>Encrypted at rest and in transit</li>
                  <li>Scalable and cost-effective</li>
                  <li>Accessible from anywhere</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow h-100">
              <div className="card-body">
                <h5 className="card-title">🔒 Privacy & Security</h5>
                <p className="card-text">
                  We take your privacy seriously:
                </p>
                <ul className="text-muted small">
                  <li>Only accessible by you</li>
                  <li>Protected by AWS IAM policies</li>
                  <li>AI analysis is instant & private</li>
                  <li>Never shared with third parties</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}