import { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [student, setStudent] = useState(() => JSON.parse(localStorage.getItem('student') || 'null'));
  const [admin, setAdmin] = useState(() => JSON.parse(localStorage.getItem('admin') || 'null'));
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('student');
    localStorage.removeItem('admin');
    setStudent(null);
    setAdmin(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-800/85 border-b border-slate-200 dark:border-slate-700/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-black text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            Student Portfolio Engine
          </div>
          
          <nav className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm font-medium">
              {student ? (
                <>
                  <Link to="/student-dashboard" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Dashboard</Link>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">|</span>
                  <span className="text-slate-600 dark:text-slate-300">Hi, <span className="font-semibold text-slate-800 dark:text-white">{student.name}</span></span>
                  <button onClick={handleLogout} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl transition font-medium cursor-pointer">Logout</button>
                </>
              ) : admin ? (
                <>
                  <Link to="/admin-dashboard" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Admin Console</Link>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">|</span>
                  <span className="px-2 py-0.5 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-md font-bold uppercase tracking-wider">Instructor</span>
                  <button onClick={handleLogout} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl transition font-medium cursor-pointer">Logout</button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Login</Link>
                  <Link to="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm shadow-blue-500/10">Register</Link>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <Link to="/admin-login" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 tracking-wide uppercase font-bold transition">Admin Portal</Link>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400 cursor-pointer"
              aria-label="Toggle structural dark theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.7 14.3A8 8 0 0 1 9.7 3.3a8.5 8.5 0 1 0 11 11Z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="currentColor"/><path strokeLinecap="round" d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"/></svg>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login setStudent={setStudent} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student-dashboard" element={student ? <StudentDashboard /> : <Navigate to="/login" replace />} />
          <Route path="/admin-login" element={<AdminLogin setAdmin={setAdmin} />} />
          <Route path="/admin-dashboard" element={admin ? <AdminDashboard /> : <Navigate to="/admin-login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;