// src/components/Input.jsx
import React from 'react';

function Input({ label, type = 'text', placeholder, value, onChange, required = false, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1 tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...props}
        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-150 text-sm"
      />
    </div>
  );
}

export default Input;