import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import GlobalLogo from '../../components/common/GlobalLogo';
import './auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    nic: '',
    position: 'student', // 'student' or 'instructor'
    instructorRegNumber: '',
    specialization: 'Light Vehicle', // Default specialization
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    verificationDoc: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Validation helper functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Phone number must have at least 10 digits';
    }
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.nic.trim()) {
      newErrors.nic = 'NIC/ID number is required';
    } else if (formData.nic.trim().length < 10) {
      newErrors.nic = 'NIC/ID must be at least 10 characters';
    }

    if (formData.position === 'instructor') {
      if (!formData.instructorRegNumber.trim()) newErrors.instructorRegNumber = 'Required';
      if (!formData.specialization) newErrors.specialization = 'Required';
      if (!formData.verificationDoc) newErrors.verificationDoc = 'Required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (errors.api) setErrors((prev) => ({ ...prev, api: '' }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, verificationDoc: e.target.files[0] }));
    if (errors.verificationDoc) setErrors((prev) => ({ ...prev, verificationDoc: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'verificationDoc') {
          if (formData[key]) dataToSend.append(key, formData[key]);
        } else {
          dataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        body: dataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ api: "This account already exists. Please login or use a different email." });
        } else {
          setErrors({ api: data.message || "Registration failed" });
        }
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message);
      setSubmitted(true);
      setLoading(false);
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ api: "Internal Server Error. Please try again later." });
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans relative overflow-hidden px-4">
        {formData.position === 'student' ? (
          <div className="w-full max-w-xl bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-12 md:p-16 rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col items-center relative z-10 text-center">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-8 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-6">Verification Link Sent!</h1>
            <p className="text-slate-400 leading-relaxed max-w-sm text-base md:text-lg">
              Please check your email <br/>
              <span className="text-[#ff4d4d] font-bold block mt-3 mb-3 text-lg md:text-xl tracking-normal">{formData.email}</span> 
              to verify your account.
            </p>
            
            <Link to="/login" className="w-full max-w-xs mt-10 bg-white/10 text-white py-4 rounded-full font-black text-lg hover:bg-white/20 hover:scale-[1.05] transition-all tracking-widest uppercase cursor-pointer">
              Return to Login
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-xl bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-12 md:p-16 rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col items-center relative z-10 text-center">
            <div className="mb-10">
              <GlobalLogo layout="horizontal" className="h-12 w-auto object-contain" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-6">Success!</h1>
            <p className="text-slate-400 leading-relaxed max-w-sm text-base md:text-lg mb-4">{successMessage}</p>
            <p className="text-slate-500 text-sm mb-4">Your registration will be reviewed by an administrator shortly.</p>
            
            <Link to="/login" className="w-full max-w-xs mt-6 bg-[#ff4d4d] text-white py-4 rounded-full font-black text-lg hover:bg-[#e64444] hover:scale-[1.05] transition-all tracking-widest uppercase shadow-xl shadow-red-500/10 cursor-pointer">
              Return to Login
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg"></div>
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-top">
            <div className="auth-logo">
              <GlobalLogo layout="vertical" />
            </div>

            <h1 className="auth-title">Sign Up</h1>
            <p className="auth-subtitle">Create your account to get started</p>
          </div>

          <div className="auth-body">
            <Link to="/login" className="auth-back">
              ← Back to Login
            </Link>

            {errors.api && (
              <div className="error-banner">
                ⚠️ {errors.api}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* First & Last Name row */}
              <div className="auth-row-split">
                <div className="field">
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    className={`input ${errors.firstName ? 'error' : ''}`}
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <div className="error-text">✗ {errors.firstName}</div>
                  )}
                </div>

                <div className="field">
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    className={`input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <div className="error-text">✗ {errors.lastName}</div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="field">
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className={`input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="error-text">✗ {errors.email}</div>
                )}
              </div>

              {/* Phone */}
              <div className="field">
                <label className="label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  className={`input ${errors.phone ? 'error' : ''}`}
                  placeholder="e.g., +1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && (
                  <div className="error-text">✗ {errors.phone}</div>
                )}
              </div>

              {/* Address Fields */}
              <div className="field">
                <label className="label">Address Line 1 *</label>
                <input
                  type="text"
                  name="addressLine1"
                  className={`input ${errors.addressLine1 ? 'error' : ''}`}
                  placeholder="Street Address, P.O. Box"
                  value={formData.addressLine1}
                  onChange={handleChange}
                />
                {errors.addressLine1 && (
                  <div className="error-text">✗ {errors.addressLine1}</div>
                )}
              </div>

              <div className="field">
                <label className="label">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  name="addressLine2"
                  className="input"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  value={formData.addressLine2}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="label">City *</label>
                <input
                  type="text"
                  name="city"
                  className={`input ${errors.city ? 'error' : ''}`}
                  placeholder="Enter your city"
                  value={formData.city}
                  onChange={handleChange}
                />
                {errors.city && (
                  <div className="error-text">✗ {errors.city}</div>
                )}
              </div>

              {/* NIC */}
              <div className="field">
                <label className="label">NIC / ID Number *</label>
                <input
                  type="text"
                  name="nic"
                  className={`input ${errors.nic ? 'error' : ''}`}
                  placeholder="National ID or Passport Number"
                  value={formData.nic}
                  onChange={handleChange}
                />
                {errors.nic && (
                  <div className="error-text">✗ {errors.nic}</div>
                )}
              </div>

              {/* Position Selection */}
              <div className="field">
                <label className="label">Account Type *</label>
                <select
                  name="position"
                  className="input"
                  value={formData.position}
                  onChange={handleChange}
                >
                  <option value="student">Student Learner</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>

              {/* Conditional: Instructor Registration Number */}
              {formData.position === 'instructor' && (
                <>
                  <div className="info-banner">
                    📋 Instructors need registration verification. Your account will be activated after admin approval.
                  </div>
                  <div className="field">
                    <label className="label">Instructor Reg. Number *</label>
                    <input
                      type="text"
                      name="instructorRegNumber"
                      className={`input ${
                        errors.instructorRegNumber ? 'error' : ''
                      }`}
                      placeholder="Issued by Sri Lanka Motor Traffic Dept."
                      value={formData.instructorRegNumber}
                      onChange={handleChange}
                    />
                    {errors.instructorRegNumber && (
                      <div className="error-text">
                        ✗ {errors.instructorRegNumber}
                      </div>
                    )}
                    <div className="input-helper">
                      Your unique instructor identification number from the motor traffic department
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Specialization *</label>
                    <select
                      name="specialization"
                      className="input"
                      value={formData.specialization}
                      onChange={handleChange}
                    >
                      <option value="Light Vehicle">Light Vehicle (Car, Van, Jeep)</option>
                      <option value="Heavy Vehicle">Heavy Vehicle (Bus, Lorry)</option>
                      <option value="Both">Both Light & Heavy Vehicle</option>
                    </select>
                  </div>

                  <div className="field">
                    <label className="label">Verification Document *</label>
                    <input
                      type="file"
                      name="verificationDoc"
                      className={`input ${errors.verificationDoc ? 'error' : ''}`}
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {errors.verificationDoc && (
                      <div className="error-text">✗ {errors.verificationDoc}</div>
                    )}
                    <div className="input-helper">
                      Upload a copy of your Instructor License or National ID (PDF/JPG/PNG)
                    </div>
                  </div>
                </>
              )}

              {/* Password */}
              <div className="field">
                <label className="label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className={`input ${errors.password ? 'error' : ''}`}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <div className="error-text">✗ {errors.password}</div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="field">
                <label className="label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={`input ${
                    errors.confirmPassword ? 'error' : ''
                  }`}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <div className="error-text">
                    ✗ {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="field">
                <label className="check">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                  />
                  <span>
                    I agree to the{' '}
                    <a href="#" className="auth-link">
                      Terms & Conditions
                    </a>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <div className="error-text">✗ {errors.agreeTerms}</div>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className={`btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-small"></span>
                ) : (
                  formData.position === 'student' ? 'Create Student Account' : 'Request Instructor Access'
                )}
              </button>

              <div className="auth-footer">
                Already have an account?{' '}
                <Link to="/login" className="auth-accent">
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
