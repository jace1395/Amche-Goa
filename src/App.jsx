import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Report from './pages/Report';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import History from './pages/History';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import BottomNav from './components/BottomNav';
import { UIProvider, useUI } from './context/UIContext';

// Auth check component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('currentUser');
  return isAuthenticated ? children : <Navigate to="/signin" />;
};

// Auth layout (no bottom nav)
const AuthLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-transparent">
    {children}
  </div>
);

// Main layout (with bottom nav, hidden when camera is open)
const MainLayout = ({ children }) => {
  const { hideNav } = useUI();

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <main className="flex-1 overflow-auto pb-24">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <UIProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/signin" element={<AuthLayout><SignIn /></AuthLayout>} />
          <Route path="/signup" element={<AuthLayout><SignUp /></AuthLayout>} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout><Home /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/report" element={
            <ProtectedRoute>
              <MainLayout><Report /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <MainLayout><History /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/rewards" element={
            <ProtectedRoute>
              <MainLayout><Rewards /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <MainLayout><Profile /></MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </UIProvider>
  );
}

export default App;
