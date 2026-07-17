import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, handleResponse } from '../utils/api.js';

function AdminLogin({ setAdmin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [uiMessage, setUiMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUiMessage(null);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await handleResponse(res);
      localStorage.setItem('admin', JSON.stringify(result.data));
      setAdmin(result.data);
      navigate('/admin-dashboard');
    } catch (error) {
      setUiMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none">
      <div className="mb-6">
        <span className="px-3 py-1 text-xs font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase bg-amber-50 dark:bg-amber-950/40 rounded-full">Instructor Gate</span>
        <h1 className="text-2xl font-black mt-2 tracking-tight text-slate-900 dark:text-white">Admin Login</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Authenticate credentials to grade portfolios.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Admin Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition" />
        </div>
        <button type="submit" className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer">Login as Admin</button>
      </form>
      
      {uiMessage && <div className="mt-4 p-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 text-sm font-semibold">{uiMessage.text}</div>}
    </div>
  );
}

export default AdminLogin;