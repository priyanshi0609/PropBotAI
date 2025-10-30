import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ChatInterface from './components/chat/ChatInterface';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import Header from './components/layout/Header';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/" />;
}

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {currentUser && <Header />}
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ChatInterface />
            </ProtectedRoute>
          } 
        />
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;