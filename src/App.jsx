import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import useAuth from './features/auth/hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Calculator from './pages/Calculator';
import { Loading } from './components/ui';
import './styles/globals.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-red-500 mb-4">{this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProtectedRoute = ({ children, isAuthenticated, loading }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Verificando autenticación..." />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children, isAuthenticated, loading }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Verificando autenticación..." />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="App">
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute isAuthenticated={isAuthenticated} loading={loading}>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/calculator"
          element={<Calculator />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/" 
          element={
            loading ? (
              <div className="min-h-screen flex items-center justify-center">
                <Loading size="lg" text="Verificando autenticación..." />
              </div>
            ) : isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/calculator" />
            )
          } 
        />
      </Routes>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <AppContent />
        </Router>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;