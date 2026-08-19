import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';
import { getErrorMessage } from '../services/api';
import FormField from '../components/FormField';
import Spinner from '../components/Spinner';
import { IconAlert, IconCheck, IconFile, IconUpload } from '../components/icons';
import './Profile.css';

export default function Profile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [nameError, setNameError] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameFormError, setNameFormError] = useState('');

  const [pwValues, setPwValues] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwFormError, setPwFormError] = useState('');

  const [resumeFile, setResumeFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setNameFormError('');
    setNameSuccess('');
    if (!name.trim() || name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }
    setNameError('');
    setNameLoading(true);
    try {
      const res = await authService.updateProfile({ name: name.trim() });
      setUser(res.data.user);
      setNameSuccess('Profile updated successfully.');
    } catch (err) {
      setNameFormError(getErrorMessage(err, 'Unable to update your profile.'));
    } finally {
      setNameLoading(false);
    }
  };

  const handlePwChange = (e) => {
    const { name: field, value } = e.target;
    setPwValues((v) => ({ ...v, [field]: value }));
    setPwErrors((err) => ({ ...err, [field]: undefined }));
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwFormError('');
    setPwSuccess('');

    const errors = {};
    if (!pwValues.currentPassword) errors.currentPassword = 'Current password is required';
    if (!pwValues.newPassword) errors.newPassword = 'New password is required';
    else if (pwValues.newPassword.length < 8) errors.newPassword = 'New password must be at least 8 characters';
    if (pwValues.newPassword !== pwValues.confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match';
    }
    if (Object.keys(errors).length) {
      setPwErrors(errors);
      return;
    }

    setPwLoading(true);
    try {
      await authService.changePassword(pwValues);
      setPwSuccess('Password changed successfully.');
      setPwValues({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPwFormError(getErrorMessage(err, 'Unable to change your password.'));
    } finally {
      setPwLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    setResumeFile(e.target.files[0] || null);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setUploadError('Please choose a PDF, DOC, or DOCX file first.');
      return;
    }
    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const res = await authService.uploadResume(formData);
      setUser(res.data.user);
      setUploadSuccess('Resume uploaded successfully.');
      setResumeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(getErrorMessage(err, 'Unable to upload your resume. Please try again.'));
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="container profile-page">
      <h1>Profile</h1>
      <p className="profile-sub">Manage your account details, password, and resume.</p>

      <div className="profile-grid">
        <div className="card card-padded">
          <h3 className="profile-card-title">Personal information</h3>

          {nameFormError && (
            <div className="form-banner form-banner-error">
              <IconAlert width={16} height={16} />
              <span>{nameFormError}</span>
            </div>
          )}
          {nameSuccess && (
            <div className="form-banner form-banner-success">
              <IconCheck width={16} height={16} />
              <span>{nameSuccess}</span>
            </div>
          )}

          <form onSubmit={handleNameSubmit} noValidate>
            <FormField label="Full name" htmlFor="name" error={nameError}>
              <input
                id="name"
                className={`form-input${nameError ? ' has-error' : ''}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError('');
                }}
              />
            </FormField>
            <FormField label="Email">
              <input className="form-input" value={user?.email || ''} disabled />
            </FormField>
            <button type="submit" className="btn btn-primary" disabled={nameLoading}>
              {nameLoading && <Spinner size={16} />}
              Save changes
            </button>
          </form>
        </div>

        <div className="card card-padded">
          <h3 className="profile-card-title">Resume</h3>
          <p className="profile-card-desc">Upload a PDF, DOC, or DOCX file (max 5MB).</p>

          {uploadError && (
            <div className="form-banner form-banner-error">
              <IconAlert width={16} height={16} />
              <span>{uploadError}</span>
            </div>
          )}
          {uploadSuccess && (
            <div className="form-banner form-banner-success">
              <IconCheck width={16} height={16} />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {user?.resumeUrl && (
            <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-current">
              <IconFile width={18} height={18} />
              <span>{user.resumeName || 'View current resume'}</span>
            </a>
          )}

          <div className="resume-upload-row">
            <input
              ref={fileInputRef}
              type="file"
              id="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="visually-hidden"
            />
            <label htmlFor="resume" className="btn btn-secondary">
              <IconUpload width={16} height={16} />
              {resumeFile ? resumeFile.name : 'Choose file'}
            </label>
            <button type="button" className="btn btn-primary" onClick={handleResumeUpload} disabled={uploadLoading}>
              {uploadLoading && <Spinner size={16} />}
              {uploadLoading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>

        <div className="card card-padded profile-full">
          <h3 className="profile-card-title">Change password</h3>

          {pwFormError && (
            <div className="form-banner form-banner-error">
              <IconAlert width={16} height={16} />
              <span>{pwFormError}</span>
            </div>
          )}
          {pwSuccess && (
            <div className="form-banner form-banner-success">
              <IconCheck width={16} height={16} />
              <span>{pwSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePwSubmit} noValidate>
            <div className="form-row">
              <FormField label="Current password" htmlFor="currentPassword" error={pwErrors.currentPassword}>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  className={`form-input${pwErrors.currentPassword ? ' has-error' : ''}`}
                  value={pwValues.currentPassword}
                  onChange={handlePwChange}
                  autoComplete="current-password"
                />
              </FormField>
              <FormField label="New password" htmlFor="newPassword" error={pwErrors.newPassword}>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className={`form-input${pwErrors.newPassword ? ' has-error' : ''}`}
                  value={pwValues.newPassword}
                  onChange={handlePwChange}
                  autoComplete="new-password"
                />
              </FormField>
            </div>
            <FormField label="Confirm new password" htmlFor="confirmNewPassword" error={pwErrors.confirmNewPassword}>
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                className={`form-input${pwErrors.confirmNewPassword ? ' has-error' : ''}`}
                value={pwValues.confirmNewPassword}
                onChange={handlePwChange}
                autoComplete="new-password"
              />
            </FormField>
            <button type="submit" className="btn btn-primary" disabled={pwLoading}>
              {pwLoading && <Spinner size={16} />}
              Update password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
