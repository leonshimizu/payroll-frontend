import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './components/layout/header';
import { LoginForm } from './components/auth/login-form';
import { DashboardPage } from './pages/dashboard';
import { CompanyPage } from './pages/company';
import { EmployeePage } from './pages/employee';
import { SettingsPage } from './pages/settings';
import { useAuthStore } from './lib/store/auth-store';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" />;
}

export function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="flex min-h-screen flex-col bg-slate-50">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/companies/:id/*" element={<CompanyPage />} />
                    <Route path="/employees/:id" element={<EmployeePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </main>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
