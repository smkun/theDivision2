import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Division 2 Gear Tracker</h1>
        <p className="subtitle">Track your armor sets and exotics</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="google-btn"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2C17.64 8.46 17.58 7.92 17.45 7.36H9V10.7H13.96C13.86 11.53 13.32 12.78 12.12 13.62L12.1 13.78L14.77 15.82L14.96 15.84C16.66 14.25 17.64 11.95 17.64 9.2Z" fill="#4285F4"/>
            <path d="M9 18C11.43 18 13.47 17.19 14.96 15.84L12.12 13.62C11.36 14.15 10.34 14.52 9 14.52C6.62 14.52 4.61 12.93 3.88 10.76L3.73 10.77L0.96 12.9L0.91 13.04C2.39 15.98 5.44 18 9 18Z" fill="#34A853"/>
            <path d="M3.88 10.76C3.69 10.2 3.58 9.61 3.58 9C3.58 8.39 3.69 7.8 3.87 7.24L3.87 7.07L1.07 4.92L0.91 4.96C0.33 6.13 0 7.43 0 9C0 10.57 0.33 11.87 0.91 13.04L3.88 10.76Z" fill="#FBBC05"/>
            <path d="M9 3.48C10.69 3.48 11.83 4.18 12.48 4.79L14.96 2.38C13.46 0.98 11.43 0 9 0C5.44 0 2.39 2.02 0.91 4.96L3.87 7.24C4.61 5.07 6.62 3.48 9 3.48Z" fill="#EB4335"/>
          </svg>
          Sign in with Google
        </button>

        <div className="toggle-mode">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="toggle-btn"
            disabled={loading}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
