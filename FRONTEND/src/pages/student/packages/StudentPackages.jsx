import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../../components/student/StudentSidebar';
import './studentPackages.css';

export default function StudentPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const userString = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
  const user = JSON.parse(userString);
  const userId = user.userId || user.user_id;

  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  // Reset confirmation if user waits too long
  useEffect(() => {
    if (confirmingId) {
      const timer = setTimeout(() => setConfirmingId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmingId]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:3000/student/packages');
      const data = await res.json();
      if (data.ok) {
        setPackages(data.packages);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load packages. Please check if your server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = async (pkg) => {
    if (confirmingId !== pkg.id) {
      setConfirmingId(pkg.id);
      return;
    }

    try {
      setSuccess(null);
      setError(null);
      setConfirmingId(null);
      const res = await fetch('http://127.0.0.1:3000/student/select-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, packageId: pkg.id })
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(`Successfully selected ${pkg.name}!`);
        // Update local storage if needed
        const updatedUser = { ...user, package_id: pkg.id };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to select package. Please try again.');
    }
  };

  return (
    <div className="pkgPage__wrapper">
      <StudentSidebar />
      
      <main className="pkgPage__main">
        <div className="pkgPage__container">
          <div className="pkgPage__header">
            <h1 className="pkgPage__title">Driving Training Packages</h1>
            <p className="pkgPage__subtitle">Choose the perfect program to kickstart your driving journey</p>
          </div>

          {error && <div className="pkgPage__alert pkgPage__alert--error">{error}</div>}
          {success && <div className="pkgPage__alert pkgPage__alert--success">{success}</div>}

          {loading ? (
            <div className="pkgPage__loading">Loading available packages...</div>
          ) : (
            <div className="pkgPage__grid">
              {packages.map(pkg => (
                <div key={pkg.id} className={`pkgPage__card glass-panel ${confirmingId === pkg.id ? 'confirming' : ''}`}>
                  <div className="pkgPage__iconTile">
                     {pkg.name.includes('Premium') ? '👑' : pkg.name.includes('Standard') ? '🚗' : '🚐'}
                  </div>
                  
                  <div className="pkgPage__price">
                    <span className="pkgPage__currency">Rs.</span>
                    <span className="pkgPage__amount">{parseFloat(pkg.price).toLocaleString()}</span>
                  </div>
                  
                  <h3 className="pkgPage__name">{pkg.name}</h3>
                  <p className="pkgPage__desc">{pkg.description}</p>

                  <div className="pkgPage__features">
                    <div className="pkgPage__featureItem">
                      <span className="pkgPage__tick">✓</span>
                      <span>Full Theory Support</span>
                    </div>
                    <div className="pkgPage__featureItem">
                      <span className="pkgPage__tick">✓</span>
                      <span>Practical Training</span>
                    </div>
                    <div className="pkgPage__featureItem">
                      <span className="pkgPage__tick">✓</span>
                      <span>Expert Instructors</span>
                    </div>
                  </div>

                  <button 
                    className={`pkgPage__selectBtn ${confirmingId === pkg.id ? 'btn-confirm' : ''}`}
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    {confirmingId === pkg.id ? 'Are you sure? Click to Confirm' : 'Select Program'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
