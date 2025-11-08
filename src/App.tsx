import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { WorkflowBuilder } from './components/WorkflowBuilder';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'signup' | 'builder'>('landing');
  const [darkMode, setDarkMode] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'signup':
        return <SignupPage onNavigate={setCurrentPage} />;
      case 'builder':
        return <WorkflowBuilder onNavigate={setCurrentPage} darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className={`size-full ${darkMode ? 'dark' : ''}`}>
      {renderPage()}
    </div>
  );
}