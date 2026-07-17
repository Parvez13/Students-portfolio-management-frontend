// src/components/Button.jsx
import React from 'react';

function Button({ children, type = 'button', variant = 'primary', disabled = false, onClick, ...props }) {
  const baseStyles = "w-full py-3.5 px-4 font-bold rounded-xl transition duration-150 active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer text-center block";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-none",
    admin: "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 dark:shadow-none",
    secondary: "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]}`}
      {...props}
    />
  );
}

export default Button;