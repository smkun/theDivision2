import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import MainApp from '@/components/MainApp';

const AppContent = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginPage />;
  }

  return <MainApp />;
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
