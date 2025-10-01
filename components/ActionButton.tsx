
import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled = false, children }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-200 ease-in-out disabled:bg-slate-500 disabled:cursor-not-allowed transform hover:scale-105"
    >
      {children}
    </button>
  );
};

export default ActionButton;
