import React from 'react';

export const SmallAmberToggle = ({ checked = false, onChange, ariaLabel = "Toggle" }) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            onClick={() => onChange && onChange(!checked)}
            className={`
        relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-1
        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2
        ${checked ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}
      `}
        >
            <span
                className={`
          pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm
          transform transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
            />
        </button>
    );
};

export default SmallAmberToggle;
