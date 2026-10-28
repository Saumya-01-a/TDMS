import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import '../auth/auth.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`http://localhost:3000/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (data.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message);
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error. Please try again later.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="auth-page">
      <div className="auth-bg"></div>
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-top">
            <div className="auth-logo">
              {status === 'verifying' ? '⏳' : status === 'success' ? '✅' : '❌'}
            </div>
            <h1 className="auth-title">Email Verification</h1>
          </div>
          <div className="auth-body" style={{ textAlign: 'center' }}>
            <p className="auth-subtitle">{message || 'Processing your verification...'}</p>
            
            {status !== 'verifying' && (
              <div style={{ marginTop: '30px' }}>
                <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  Go to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
