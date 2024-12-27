import { useState } from 'react';
import Login from './LoginView';
import SignUp from './SignUpView';

export default function WelcomePage({ onAuth }) {
  const [currentView, setCurrentView] = useState('welcome'); // 'welcome', 'login', or 'signup'

  const handleLoginSuccess = (userData) => {
    onAuth({ type: 'user', user: userData });
  };

  const renderView = () => {
    switch(currentView) {
      case 'login':
        return (
          <Login 
            onCancel={() => setCurrentView('welcome')}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'signup':
        return (
          <SignUp 
            onCancel={() => setCurrentView('welcome')}
          />
        );
      default:
        return (
          <div className='main_welcome'>
            <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to Phreddit</h1>
              <p style={{ marginBottom: '2rem' }}>Choose how you'd like to continue</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  onClick={() => setCurrentView('login')}
                  className="home_sidebar"
                >
                  Login
                </button>
                <button
                  onClick={() => setCurrentView('signup')}
                  className="home_sidebar"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => onAuth({ type: 'guest' })}
                  className="home_sidebar"
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="phreddit-container">
      {renderView()}
    </div>
  );
}