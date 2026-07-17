import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, handleResponse } from '../utils/api.js';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uiMessage, setUiMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUiMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/students/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const result = await handleResponse(res);
      setUiMessage({ type: 'success', text: result.message });
      
      // Auto-route to login page after a brief delay for a better user experience
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setUiMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-200">
      <div className="mb-6">
        <span className="px-3 py-1 text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-950/40 rounded-full">
          New Workspace
        </span>
        <h1 className="text-2xl font-black mt-2 tracking-tight text-slate-900 dark:text-white">
          Register Student
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Create your account and prepare to submit your project for review.
        </p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input 
          label="Your Name"
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter your full name" 
          required 
        />

        <Input 
          label="Email Address"
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="name@example.com" 
          required 
        />

        <Input 
          label="Password"
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="••••••••" 
          required 
        />

        <Button 
          type="submit" 
          variant="primary" 
          disabled={loading}
        >
          {loading ? "Creating Profile..." : "Create account"}
        </Button>
      </form>
      
      {uiMessage && (
        <div className={`mt-4 p-3 rounded-xl border text-sm font-semibold ${
          uiMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60' 
            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
        }`}>
          {uiMessage.text}
        </div>
      )}
    </div>
  );
}

export default Register;